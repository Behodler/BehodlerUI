pragma solidity ^0.5.0;
import "../node_modules/openzeppelin-solidity/contracts/ownership/Secondary.sol";
import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "./WeiDai.sol";



contract WeiDaiBank is Secondary {

	address weiDaiAddress;
	address daiAddress;

	using SafeMath for uint;

	function setDependencies(address weiDai, address dai) public onlyPrimary{
		daiAddress = dai;
		weiDaiAddress = weiDai;
	} 

	function getDaiPerWeiDai() public view returns (uint) {
		return ERC20(daiAddress).totalSupply().div(WeiDai(weiDaiAddress).totalSupply());

	}

	function issue(address sender, uint weidai,uint dai) public { //sender is dai holder, msg.sender is calling contract
		address self = address(this);
		ERC20(daiAddress).transferFrom(sender, self,dai); 
		WeiDai(weiDaiAddress).issue(msg.sender, weidai);
	}

	function redeemWeiDai(uint weiDai) public {
		WeiDai(weiDaiAddress).burn(msg.sender, weiDai);
		uint weiDaiToRedeem = weiDai*100/98;
		uint daiPayable = getDaiPerWeiDai().mul(weiDaiToRedeem);
		ERC20(daiAddress).transfer(msg.sender, daiPayable);
	}
}
