pragma solidity >=0.4.21 <0.6.0;
import "../node_modules/openzeppelin-solidity/contracts/ownership/Secondary.sol";
import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "./WeiDai.sol";
import "./PatienceRegulationEngine.sol";
import "./baseContracts/Versioned.sol";

contract WeiDaiBank is Secondary, Versioned {

	address donationAddress;
	address self;
	uint lastKnownExchangeRate;

	using SafeMath for uint;

	constructor() public{
		self = address(this);
		lastKnownExchangeRate = 100; //1 weidai == 1 US cent.
	}

	function setDonationAddress(address donation) public onlyPrimary {
		donationAddress = donation;
	}

	function getDonationAddress () external view returns (address) {
		return donationAddress;
	}

	function daiPerMyriadWeidai() public view returns (uint) {
		uint totalWeiDai = WeiDai(getWeiDai()).totalSupply();
		
		if(totalWeiDai == 0){
			return lastKnownExchangeRate;
		}
		return ERC20(getDai()).balanceOf(self)
		.mul(10000) //scale by a myriad
		.div(WeiDai(getWeiDai()).totalSupply());
	}

	function issue(address sender, uint weidai, uint dai) external { //sender is dai holder, msg.sender is calling contract
		require(msg.sender == getPRE(), "only patience regulation engine can invoke this function");
		ERC20(getDai()).transferFrom(sender, self, dai);//failing live at this point
		WeiDai(getWeiDai()).issue(msg.sender, weidai);
	}

	function redeemWeiDai(uint weiDai) external versionMatch {
		uint exchangeRate = daiPerMyriadWeidai();
		uint fee = WeiDai(getWeiDai()).totalSupply() - weiDai == 0? 0 : weiDai*2/100;
		uint donation = (fee*PatienceRegulationEngine(getPRE()).getDonationSplit(msg.sender))/100;

		WeiDai(getWeiDai()).burn(msg.sender, weiDai-donation);
		WeiDai(getWeiDai()).transferFrom(msg.sender, self,donation);

		uint weiDaiToRedeem = weiDai - fee;
		 
		uint daiPayable = weiDaiToRedeem
		.mul(exchangeRate)
		.div(10000);
		ERC20(getDai()).transfer(msg.sender, daiPayable);
		lastKnownExchangeRate = daiPerMyriadWeidai();
		emit DaiPerMyriadWeiDai (lastKnownExchangeRate, block.timestamp, block.number);
	}

	function withdrawDonations() public onlyPrimary {
		uint balance = ERC20(getWeiDai()).balanceOf(self);
		ERC20(getWeiDai()).transfer(donationAddress,balance);
	} 

	event DaiPerMyriadWeiDai (uint amount, uint timestamp, uint blocknumber);
}
