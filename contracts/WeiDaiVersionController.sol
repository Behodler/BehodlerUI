pragma solidity 0.5;

import "../node_modules/openzeppelin-solidity/contracts/ownership/Secondary.sol";
import "./PatienceRegulationEngine.sol";
import "./WeiDaiBank.sol";
import "./WeiDai.sol";

contract WeiDaiVersionController is Secondary{
	struct contractFamily{
		address  weiDai;
		address dai;
		address   patienceRegulationEngine;
		address   weiDaiBank;
		bool enabled;
		bytes32 name;
	}
	mapping (uint=>contractFamily) versionedContractFamilies;
	mapping (address=>uint) contractVersion;
	mapping (address=>uint) activeVersion;
	uint defaultVersion;

	function setContractGroup(uint ver, address weiDai, address dai, address pre, address bank, bytes32 name, bool enabled) external onlyPrimary{
		require(ver>0, "version zero reserved.");
		versionedContractFamilies[ver] = contractFamily({
			weiDai:weiDai,
			dai:dai,
			patienceRegulationEngine:pre,
			weiDaiBank:bank,
			enabled:enabled,
			name:name
		});
		contractVersion[weiDai] = ver;
		contractVersion[dai] = ver;
		contractVersion[pre] = ver;
		contractVersion[bank] = ver;
	}

	function getWeiDai(uint version) public view returns (address ){
		return versionedContractFamilies[version].weiDai;
	}

	function getDai(uint version) public view returns (address){
		return versionedContractFamilies[version].dai;
	}

	function getPRE(uint version) public view returns (address ){
		return versionedContractFamilies[version].patienceRegulationEngine;
	}

	function getWeiDaiBank(uint version) public view returns (address ){
		return versionedContractFamilies[version].weiDaiBank;
	}

	function getContractFamilyName (uint version) external view returns (string memory) {
		bytes memory name = new bytes(16);
		for(uint i = 0;i<16;i++){
			name[i] = versionedContractFamilies[version].name[i];
		}
		return string(name);
	}

	function renameContractFamily (uint version, bytes32 name) external onlyPrimary {
		versionedContractFamilies[version].name = name;
	}

	function setEnabled(uint version, bool enabled) external onlyPrimary {
		versionedContractFamilies[version].enabled = enabled;
	}

	function isEnabled(uint version) external view returns (bool) {
		return versionedContractFamilies[version].enabled;
	}

	function setActiveVersion(uint version) public onlyPrimary {
		require(defaultVersion!=0, "default version not set");
		require(versionedContractFamilies[version].dai != address(0),"invalid version");
		activeVersion[msg.sender] = version;
	}

	function getUserActiveVersion(address user) external view returns (uint) {
		require(defaultVersion!=0, "default version not set");
		return activeVersion[user] == 0 ? defaultVersion: activeVersion[user];
	}

	function setDefaultVersion (uint version) external onlyPrimary {
		require(versionedContractFamilies[version].dai != address(0),"invalid version");
		defaultVersion = version;
	}

	function getDefaultVersion () external view returns (uint){
		return defaultVersion;
	}

	function getContractVersion(address c) external view returns (uint) {
		require(contractVersion[c] > 0, "contract unversioned");
		return contractVersion[c];
	}

	function claimAndRedeem (uint version) public {
		PatienceRegulationEngine(getPRE(version)).claimWeiDaiFor(msg.sender);
		address weiDai = getWeiDai(version);
		address bank = getWeiDaiBank(version);
		WeiDai(weiDai).approveFor(msg.sender,bank,2**255);
		uint balance = WeiDai(weiDai).balanceOf(msg.sender);
		WeiDaiBank(bank).redeemWeiDaiFor(balance, msg.sender,bank);
	}
}