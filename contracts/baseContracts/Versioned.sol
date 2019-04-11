pragma solidity ^0.5.0;
import "../../node_modules/openzeppelin-solidity/contracts/ownership/Secondary.sol";
import "../WeiDaiVersionController.sol";

contract Versioned is Secondary{
	address internal versionController;
	uint internal version;

	function setVersionController(address controller) external onlyPrimary{
		versionController = controller;
		refreshVersion();
	}

	modifier versionMatch(){
		require(versionController != address(0) 
		&& version == WeiDaiVersionController(versionController).getUserActiveVersion(msg.sender),"version mismatch");
		_;
	}

	function refreshVersion() public { 
		version = WeiDaiVersionController(versionController).getContractVersion(address(this));
	}

	function getWeiDai() internal view returns (address) {
		return WeiDaiVersionController(versionController).getWeiDai(version);
	}
	
	function getDai() internal view returns (address) {
		return WeiDaiVersionController(versionController).getDai(version);
	}

	function getPRE() internal view returns (address) {
		return WeiDaiVersionController(versionController).getPRE(version);
	}

	function getWeiDaiBank() internal view returns (address) {
		return WeiDaiVersionController(versionController).getWeiDaiBank(version);
	}
}