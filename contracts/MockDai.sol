pragma solidity  0.5;
import "../node_modules//openzeppelin-solidity/contracts/ownership/Secondary.sol";
import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";

contract MockDai is Secondary, ERC20 {

	constructor() public{
		uint gwei = 13 * (1 ether/100);
		_mint(msg.sender,1e8 ether + gwei);
	}

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


