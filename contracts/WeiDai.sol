pragma solidity ^0.5.0;
import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "../node_modules/openzeppelin-solidity/contracts/ownership/Secondary.sol";
import "./baseContracts/Versioned.sol";

contract WeiDai is Secondary, ERC20, Versioned {

	modifier onlyBank(){
		require(getWeiDaiBank() == msg.sender || getPRE() == msg.sender, "requires bank authorization");
		_;
	}

	function issue(address recipient, uint value) public onlyBank {
		_mint(recipient, value);
	}

	function burn (address from, uint value) public onlyBank{
		_burn(from, value);
	}

	function name() public pure returns (string memory) {
		return "WeiDai";
	}

	function symbol() public pure returns (string memory) {
		return "WDAI";
	}

	function decimals() public pure returns (uint8) {
		return 18;
	}
}