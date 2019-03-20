pragma solidity ^0.5.0;
import "../node_modules/openzeppelin-solidity/contracts/ownership/Secondary.sol";
import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "./WeiDai.sol";



contract WeiDaiBank is Secondary {

	address weiDaiAddress;
	address daiAddress;
	address donationAddress;
	address preAddress;
	address self;
	uint lastKnownExchangeRate;

	using SafeMath for uint;

	function setDependencies(address weiDai, address dai, address pre) public onlyPrimary{
		daiAddress = dai;
		weiDaiAddress = weiDai;
		preAddress = pre;
		self = address(this);
		lastKnownExchangeRate = 1000;
	} 

	function setDonationAddress(address donation) public onlyPrimary {
		donationAddress = donation;
	}

	function getWeiDaiPerDai()public view returns (uint) {
		uint totalWeiDai = WeiDai(weiDaiAddress).totalSupply();
		if(totalWeiDai == 0)
			return lastKnownExchangeRate; //initial exchange rate is 1 weidai == 1/1000th dai as an aesthetic early adopter perk (get in before parity)
		return WeiDai(weiDaiAddress).totalSupply().div(ERC20(daiAddress).balanceOf(self));
	}

	function issue(address sender, uint weidai,uint dai) public { //sender is dai holder, msg.sender is calling contract
		require(msg.sender == preAddress, "only patience regulation engine can invoke this function");
		ERC20(daiAddress).transferFrom(sender, self, dai); 
		WeiDai(weiDaiAddress).issue(msg.sender, weidai);
	}

	function redeemWeiDai(uint weiDai) public {
		WeiDai(weiDaiAddress).burn(msg.sender, weiDai);
		uint weiDaiToRedeem = weiDai*100/98;
		lastKnownExchangeRate = getWeiDaiPerDai();
		uint daiPayable = weiDaiToRedeem.div(lastKnownExchangeRate);
		ERC20(daiAddress).transfer(msg.sender, daiPayable);
	}

	function donate(uint amount) public {
		ERC20(weiDaiAddress).transferFrom(msg.sender,self,amount);
	}

	function withdrawDonations() public onlyPrimary {
		uint balance = ERC20(weiDaiAddress).balanceOf(self);
		ERC20(weiDaiAddress).transfer(donationAddress,balance);
	} 
}
