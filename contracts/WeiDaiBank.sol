pragma solidity ^0.5.0;
import "../node_modules/openzeppelin-solidity/contracts/ownership/Secondary.sol";

contract WeiDaiBank is Secondary {

	address weiDai;
	address dai;

	function setDependencies(address weiDaiAddress, address daiAddress) public onlyPrimary{
		dai = daiAddress;
		weiDai = weiDaiAddress;
	} 
}
