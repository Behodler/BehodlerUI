pragma solidity  0.5;
import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "../node_modules/openzeppelin-solidity/contracts/ownership/Secondary.sol";
import "./baseContracts/Versioned.sol";

contract WeiDai is Secondary, ERC20, Versioned {

	mapping (address=>mapping(address=>uint)) arsonAllowance;

	modifier onlyBank(){
		require(getWeiDaiBank() == msg.sender || getPRE() == msg.sender, "requires bank authorization");
		_;
	}

	function issue(address recipient, uint value) public onlyBank {
		_mint(recipient, value);
	}

	function approveArson(address arsonist, uint value) external {
		arsonAllowance[msg.sender][arsonist] = value;
		emit arsonApproved(msg.sender,arsonist,value);
	}

	function getArsonAllowance (address arsonist, address holder) public view returns (uint){
		return arsonAllowance[holder][arsonist];
	}

	function burn (address holder, uint value) public {
		bool canBurn = holder == msg.sender ||
					getArsonAllowance(msg.sender,holder) >= value ||
					getWeiDaiBank() == msg.sender ||
		getPRE() == msg.sender;

		require(canBurn, "unauthorized to burn WeiDai");

		if(getArsonAllowance(msg.sender,holder) >= value){
			arsonAllowance[holder][msg.sender] -= value;
		}

		_burn(holder, value);
		emit weiDaiBurnt(msg.sender, holder, value);
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

	event arsonApproved (address msgsender, address arsonist, uint value);
	event weiDaiBurnt(address indexed burner, address holder, uint value);
}