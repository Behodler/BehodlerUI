pragma solidity ^0.5.0;
import "../node_modules/openzeppelin-solidity/contracts/ownership/Secondary.sol";
import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "./WeiDaiBank.sol";
import "./WeiDai.sol";

contract PatienceRegulationEngine is Secondary {
	uint marginalPenaltyDrawdownPeriod; //aka mining difficulty
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
	}
	
	function buyWeiDai(uint dai, uint split) public {
		require(lockedWeiDai[msg.sender] == 0,"must claim weidai before buying more.");		
		require(split<=100, "split is a % expressed as an integer between 0 and 100");
		uint weiDaiToBuy = dai.div(WeiDaiBank(weiDaiBankAddress).getDaiPerWeiDai());

		WeiDaiBank(weiDaiBankAddress).issue(msg.sender, weiDaiToBuy, dai);
		lockedWeiDai[msg.sender] = weiDaiToBuy;
		penaltyDrawdownPeriod[msg.sender] = marginalPenaltyDrawdownPeriod;
		blockOfPurchase[msg.sender] = block.number;
		donationBurnSplit[msg.sender] = split;
	}

	function claimWeiDai() public {
		if(lockedWeiDai[msg.sender] == 0)
		    return;
		uint penalty = calculateCurrentPenalty(msg.sender);
		uint weiDai = lockedWeiDai[msg.sender];
		if(penalty==0)
		{
			marginalPenaltyDrawdownPeriod = marginalPenaltyDrawdownPeriod.add(100);
		}
		else
		{
			uint penaltyTax = penalty.mul(weiDai).div(100);
			weiDai = weiDai.sub(penaltyTax);
			uint donation = donationBurnSplit[msg.sender]
			.mul(penalty)
			.div(100);

			address self = address(this);
			WeiDai(weiDaiAddress).burn(self,penalty.sub(donation));

			if(donation>0){
				WeiDai(weiDaiAddress).approve(weiDaiBankAddress,donation);
				WeiDaiBank(weiDaiBankAddress).donate(donation);
			}

			if(marginalPenaltyDrawdownPeriod <= penalty)
		        marginalPenaltyDrawdownPeriod = 1;
		    else 
				marginalPenaltyDrawdownPeriod -= penalty;
		}
		
		lockedWeiDai[msg.sender] = 0;
		WeiDai(weiDaiAddress).transfer(msg.sender,weiDai);
	}

	function calculateCurrentPenalty(address holder) private view returns (uint) {
		uint periods = (block.number.sub(blockOfPurchase[holder])).div(penaltyDrawdownPeriod[holder]);
		if(periods >= 20)
		    return 0;
		return 100 - (5 * periods);
	}
}