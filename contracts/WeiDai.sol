pragma solidity ^0.5.0;
import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "../node_modules/openzeppelin-solidity/contracts/ownership/Secondary.sol";

contract WeiDai is Secondary, ERC20 {
	mapping (address=>bool) banks;
	
	function setBank(address bank, bool authorize ) public onlyPrimary{
		banks[bank] = authorize;
	} 

	function issue(address recipient, uint value) public {
		require (banks[msg.sender],"unauthorized to issue new tokens");
		_mint(recipient, value);
	}

	function burn (address from, uint value) public {
		require (banks[msg.sender],"unauthorized to burn tokens");
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