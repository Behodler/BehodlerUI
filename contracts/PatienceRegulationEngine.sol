pragma solidity >=0.5.0 <0.6.0;
import "../node_modules/openzeppelin-solidity/contracts/ownership/Secondary.sol";
import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "./WeiDaiBank.sol";
import "./WeiDai.sol";
import "./baseContracts/Versioned.sol";

contract PatienceRegulationEngine is Secondary, Versioned {
	uint marginalPenaltyDrawdownPeriod; //aka mining difficulty
	uint claimWindowsPerAdjustment;
	uint lastAdjustmentBlock;
	uint launchTimeStamp;
	uint betaPhase;
	int currentAdjustmentWeight;
	mapping(address=>uint) lockedWeiDai;
	mapping (address=>uint) penaltyDrawdownPeriod;
	mapping (address=>uint) blockOfPurchase;
	mapping (address=>uint) donationBurnSplit;
	mapping (address => mapping (address=> uint)) claimDelegateReward;

	using SafeMath for uint;

	constructor () public {
		marginalPenaltyDrawdownPeriod = 1;
		launchTimeStamp = block.timestamp;
	}

	function setBetaPhase(uint b) public onlyPrimary {
		betaPhase = b * (1 days);
	}

	function setClaimWindowsPerAdjustment(uint c) public onlyPrimary {
		require(betaPhase==0 || isBetaPhase(), "environmental variables can only be altered during beta period");
		claimWindowsPerAdjustment = c;
	}

	function getCurrentAdjustmentWeight() public view returns (int) {
		return currentAdjustmentWeight;
	}

	function getBlockOfPurchase() public view returns (uint) {
		return blockOfPurchase[msg.sender];
	}

	function getClaimWindowsPerAdjustment() public view returns (uint) {
		return claimWindowsPerAdjustment;
	}

	function getLastAdjustmentBlockNumber() public view returns (uint) {
		return lastAdjustmentBlock;
	}

	function getCurrentPenalty() public view returns (uint) {
		return marginalPenaltyDrawdownPeriod;
	}

	function getLockedWeiDai(address hodler) public view returns (uint) {
		return lockedWeiDai[hodler];
	}

	function isBetaPhase() private view returns (bool){
		return betaPhase!=0 && (block.timestamp - launchTimeStamp < betaPhase);
	}

	function buyWeiDai(uint dai, uint split) public versionMatch enabledOnly {
		require(!isBetaPhase() || dai <= 100, "maximum 100 dai can be purchased during beta phase.");
		require(!isBetaPhase() || ERC20(getDai()).balanceOf(getWeiDaiBank()) <= 10000, "beta phase maximum dai limit reached.");
		require(lockedWeiDai[msg.sender] == 0,"must claim weidai before buying more.");
		setDonationSplit(msg.sender,split);
		uint weiDaiToBuy = dai.mul(10000).div(WeiDaiBank(getWeiDaiBank()).daiPerMyriadWeidai());

		WeiDaiBank(getWeiDaiBank()).issue(msg.sender, weiDaiToBuy, dai);
		lockedWeiDai[msg.sender] = weiDaiToBuy;
		penaltyDrawdownPeriod[msg.sender] = marginalPenaltyDrawdownPeriod;
		blockOfPurchase[msg.sender] = block.number;
	}

	function setClaimDelegate(address delegate, uint rewardPercentage) external versionMatch {
		require(rewardPercentage<=10000, "reward must be % expressed as an integer between 0 and 10,000");
		claimDelegateReward[msg.sender][delegate] = rewardPercentage + 1;
	}

	function disableClaimDelegate(address delegate) external versionMatch {
		claimDelegateReward[msg.sender][delegate] = 0;
	}

	function claimWeiDai() external versionMatch {
		if(lockedWeiDai[msg.sender] == 0)
		    return;
		claim(msg.sender, address(0), 0);
	}

	function claimWeiDaiFor(address recipient) external versionMatch {
		require(claimDelegateReward[recipient][msg.sender]>0, "claimFor disabled for this user: recipient must invoke the setClaimDelegate function.");
		claim(recipient, msg.sender, claimDelegateReward[recipient][msg.sender]);
	}

	function claim(address recipient, address delegate, uint reward) private {
		uint penalty = calculateCurrentPenalty(recipient);
		uint weiDai = lockedWeiDai[recipient];
		if(penalty==0)
		{
			int adjustment = int(weiDai * 100);
			currentAdjustmentWeight = currentAdjustmentWeight+adjustment>currentAdjustmentWeight?currentAdjustmentWeight+adjustment:currentAdjustmentWeight; //handle overflow
		}
		else
		{
			uint penaltyTax = penalty.mul(weiDai).div(100); //div 100 turns penalty into a %
			int adjustment = int(weiDai * penalty);
			weiDai = weiDai.sub(penaltyTax);

			uint donation = getDonationSplit(recipient)
			.mul(penaltyTax)
			.div(100);

			address self = address(this);
			WeiDai(getWeiDai()).burn(self, penaltyTax.sub(donation));

			if(donation>0){
				WeiDai(getWeiDai()).transfer(getWeiDaiBank(),donation);
			}
			currentAdjustmentWeight = currentAdjustmentWeight-adjustment<currentAdjustmentWeight?currentAdjustmentWeight-adjustment:currentAdjustmentWeight; //handle underflow
		}
		adjustPatienceDifficulty();
		lockedWeiDai[recipient] = 0;
		uint delegateWeiDai = reward > 0? (weiDai * (reward-1))/10000 : 0;
		uint recipientWeiDai = weiDai - delegateWeiDai;

		WeiDai(getWeiDai()).transfer(recipient, recipientWeiDai);
		if(delegate != address(0)){
			WeiDai(getWeiDai()).transfer(delegate, delegateWeiDai);
		}
	}

	function calculateCurrentPenalty(address holder) public view returns (uint) {
		uint periods = (block.number.sub(blockOfPurchase[holder])).div(penaltyDrawdownPeriod[holder]);
		if(periods >= 20)
		    return 0;
		return 100 - (5 * periods);
	}

	function adjustPatienceDifficulty() private {
		if(nextPatienceAdjustment()){
			if(currentAdjustmentWeight > 0)
				marginalPenaltyDrawdownPeriod = marginalPenaltyDrawdownPeriod << 1;//double penalty
			else if(currentAdjustmentWeight < 0)
				marginalPenaltyDrawdownPeriod = marginalPenaltyDrawdownPeriod>>1==0?1:marginalPenaltyDrawdownPeriod >> 1;//halve penalty

			currentAdjustmentWeight = 0;
			lastAdjustmentBlock = block.number;
		}
	}

	function nextPatienceAdjustment() private view returns (bool) {
		uint durationSinceLastAdjustment = block.number - lastAdjustmentBlock;
		uint patienceAdjustmentDuration = getClaimWaitWindow() * claimWindowsPerAdjustment;
		return durationSinceLastAdjustment >= patienceAdjustmentDuration;
	}

	function getClaimWaitWindow() public view returns (uint) {
		return marginalPenaltyDrawdownPeriod * 20;
	}

	function setDonationSplit(uint split) external versionMatch {
		setDonationSplit(msg.sender,split);
	}

	function setDonationSplit(address user, uint split) private {
		require(split<100, "split is a % expressed as an integer between 0 and 99");
		donationBurnSplit[user] = split + 1;
	}

	function getDonationSplit(address user) public view returns (uint) {
		if(donationBurnSplit[user]==0)
			return 10; //defaults to 10%
		return donationBurnSplit[user]-1;
	}
}