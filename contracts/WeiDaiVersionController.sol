pragma solidity ^0.5.0;

import "../node_modules/openzeppelin-solidity/contracts/ownership/Secondary.sol";

contract WeiDaiVersionController is Secondary{ //TODO: implement
	struct contractFamily{
		address weiDai;
		address dai;
		address patienceRegulationEngine;
		address weiDaiBank;
		bool enabled;
		bytes16 name;
	}
	mapping (uint=>contractFamily) versionedContractFamilies;
	mapping (address=>uint) contractVersion;
	mapping (address=>uint) activeVersion;
	uint defaultVersion;
	
	function setContractGroup(uint version, address weiDai, address dai, address pre, address bank, bytes16 name) external onlyPrimary{
		require(version>0, "version zero reserved.");
		versionedContractFamilies[version] = contractFamily({
			weiDai:weiDai,
			dai:dai,
			patienceRegulationEngine:pre,
			weiDaiBank:bank,
			enabled:true,
			name:name
		});
		contractVersion[weiDai] = version;
		contractVersion[dai] = version;
		contractVersion[pre] = version;
		contractVersion[bank] = version;
	}

	function getWeiDai(uint version) external view returns (address){
		return versionedContractFamilies[version].weiDai;
	}

	function getDai(uint version) external view returns (address){
		return versionedContractFamilies[version].dai;
	}

	function getPRE(uint version) external view returns (address){
		return versionedContractFamilies[version].patienceRegulationEngine;
	}

	function getWeiDaiBank(uint version) external view returns (address){
		return versionedContractFamilies[version].weiDaiBank;
	}

	function setEnabled(uint version, bool enabled) external onlyPrimary {
		versionedContractFamilies[version].enabled = enabled;
	}

	function getContractFamilyName (uint version) external view returns (string memory) {
		bytes memory name = new bytes(16);
		for(uint i = 0;i<16;i++){
			name[i] = versionedContractFamilies[version].name[i];
		}
		return string(name);
	}

	function setActiveVersion(uint version) external {
		require(defaultVersion!=0, "default version not set");
		require(versionedContractFamilies[version].dai != address(0),"invalid version");
		activeVersion[msg.sender] = version;
	}

	function getUserActiveVersion(address user) external view returns (uint) {
		require(defaultVersion!=0, "default version not set");
		return activeVersion[user] == 0 ?defaultVersion: activeVersion[user];
	}

	function setDefaultVersion (uint version) external onlyPrimary {
		require(versionedContractFamilies[version].dai != address(0),"invalid version");
		defaultVersion = version;
	}

	function getContractVersion(address c) external view returns (uint) {
		require(contractVersion[c] > 0, "contract unversioned");
		return contractVersion[c];
	}
}