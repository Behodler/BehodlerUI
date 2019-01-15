pragma solidity ^0.5.0;
import "../node_modules//openzeppelin-solidity/contracts/ownership/Secondary.sol"; 
import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";

contract MockDai is Secondary, ERC20 {
	function name() public pure returns (string memory) {
		return "Mock DAI";
	}

	function symbol() public pure returns (string memory) {
		return "MDAI";
	}

	function decimals() public pure returns (uint8) {
		return 18;
	}
}


