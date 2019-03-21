pragma solidity ^0.5.0;
import "../node_modules/openzeppelin-solidity/contracts/ownership/Secondary.sol";
import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "./WeiDaiBank.sol";
import "./WeiDai.sol";

contract PatienceRegulationEngine is Secondary {
	uint marginalPenaltyDrawdownPeriod; //aka mining difficulty
	uint claimWindowsPerAdjustment;
	uint lastAdjustmentBlock;
	uint launchTimeStamp;
	int currentAdjustmentWeight;
	address weiDaiBankAddress;
	address weiDaiAddress;
	mapping(address=>uint) lockedWeiDai;
	mapping (address=>uint) penaltyDrawdownPeriod;
	mapping (address=>uint) blockOfPurchase;
	mapping (address=>uint) donationBurnSplit;

	using SafeMath for uint;

	function setDependencies(address bank, address weiDai) public onlyPrimary{
		weiDaiBankAddress = bank;
		weiDaiAddress = weiDai;
		marginalPenaltyDrawdownPeriod = 1;
		launchTimeStamp = block.timestamp;
	}

	function setClaimWindowsPerAdjustment(uint c) public onlyPrimary {
		require(block.timestamp - launchTimeStamp <= 365 days, "environmental variables can only be altered in first year");
		claimWindowsPerAdjustment = c;
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

	function buyWeiDai(uint dai, uint split) public {
		require(lockedWeiDai[msg.sender] == 0,"must claim weidai before buying more.");		
		require(split<=100, "split is a % expressed as an integer between 0 and 100");			
		uint weiDaiToBuy = dai.mul(WeiDaiBank(weiDaiBankAddress).getWeiDaiPerDai());

		WeiDaiBank(weiDaiBankAddress).issue(msg.sender, weiDaiToBuy, dai);
		lockedWeiDai[msg.sender] = weiDaiToBuy;
		penaltyDrawdownPeriod[msg.sender] = marginalPenaltyDrawdownPeriod;
		blockOfPurchase[msg.sender] = block.number;
		donationBurnSplit[msg.sender] = split;
	}

	function claimWeiDai() public {
		if(lockedWeiDai[msg.sender] == 0)
		    return;

		adjustDailyPatienceDifficulty();

		uint penalty = calculateCurrentPenalty(msg.sender);
		uint weiDai = lockedWeiDai[msg.sender];
		if(penalty==0)
		{
			int adjustment = int(weiDai * 100);
			currentAdjustmentWeight = currentAdjustmentWeight+adjustment>currentAdjustmentWeight?currentAdjustmentWeight+adjustment:currentAdjustmentWeight; //handle overflow
		}
		else
		{
			uint penaltyTax = penalty.mul(weiDai).div(100); //div 100 turns penalty into a %
			weiDai = weiDai.sub(penaltyTax);
			uint donation = donationBurnSplit[msg.sender]
			.mul(penalty)
			.div(100);

			address self = address(this);
			WeiDai(weiDaiAddress).burn(self, penalty.sub(donation));

			if(donation>0){
				WeiDai(weiDaiAddress).transfer(weiDaiBankAddress,donation);
			}
			int adjustment = int(weiDai * penalty);
			currentAdjustmentWeight = currentAdjustmentWeight-adjustment<currentAdjustmentWeight?currentAdjustmentWeight-adjustment:currentAdjustmentWeight; //handle underflow
		}
		
		lockedWeiDai[msg.sender] = 0;
		WeiDai(weiDaiAddress).transfer(msg.sender, weiDai);
	}

	function calculateCurrentPenalty(address holder) private view returns (uint) {
		uint periods = (block.number.sub(blockOfPurchase[holder])).div(penaltyDrawdownPeriod[holder]);
		if(periods >= 20)
		    return 0;
		return 100 - (5 * periods);
	}

	function adjustDailyPatienceDifficulty() private {
		if(nextPatienceAdjustment()){
			if(currentAdjustmentWeight > 0)
				marginalPenaltyDrawdownPeriod << 1;//double penalty
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
}