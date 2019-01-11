pragma solidity ^0.4.20;
import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "../node_modules/openzeppelin-solidity/contracts/ownership/Secondary.sol";

contract Updai {
	mapping (address=>bool) banks;
	
	function setBank(address bank, bool authorize ) public onlyPrimary{
		banks[bank] = authorize;
	} 

	function issue(address recipient, address bank, uint value) public {
		require (banks[bank],"unauthorized to issue new tokens");
		_mint((recipient), value);
	}

	function burn (address from, address bank, uint value) public {
		require (banks[bank],"unauthorized to burn tokens");
		_burn(from, value);
	}

	function name() public pure returns (string memory) {
		return "Finswitch Rand";
	}

	function symbol() public pure returns (string memory) {
		return "RFIN";
	}

	function decimals() public pure returns (uint8) {
		return 18;
	}
}