pragma solidity >=0.4.21 <0.6.0;
import "../../node_modules/openzeppelin-solidity/contracts/ownership/Secondary.sol";
import "../WeiDaiVersionController.sol";

contract Versioned is Secondary{
	address internal versionController;

	function setVersionController(address controller) external onlyPrimary{
		versionController = controller;
	}

	modifier versionMatch(){
		require(versionController != address(0) && getVersion() == WeiDaiVersionController(versionController).getUserActiveVersion(msg.sender), "version mismatch");
		_;
	}

	modifier enabledOnly(){
		require(versionController != address(0) && WeiDaiVersionController(versionController).isEnabled(getVersion()), "version disabled");
		_;
	}

	function getVersion() internal view returns (uint) {
		return WeiDaiVersionController(versionController).getContractVersion(address(this));
	}

	function getWeiDai() internal view returns (address ) {
		return WeiDaiVersionController(versionController).getWeiDai(getVersion());
	}
	
	function getDai() internal view returns (address) {
		return WeiDaiVersionController(versionController).getDai(getVersion());
	}

	function getPRE() internal view returns (address ) {
		return WeiDaiVersionController(versionController).getPRE(getVersion());
	}

	function getWeiDaiBank() internal view returns (address ) {
		return WeiDaiVersionController(versionController).getWeiDaiBank(getVersion());
	}
}