pragma solidity >=0.5.0 <0.6.0;
import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "../node_modules/openzeppelin-solidity/contracts/ownership/Secondary.sol";
import "./baseContracts/Versioned.sol";
import "./PatienceRegulationEngine.sol";
import "./WeiDaiVersionController.sol";

contract WeiDai is Secondary, ERC20, Versioned {

	mapping (address=>mapping(address=>uint)) arsonAllowance;

	modifier onlyBank(){
		require(getWeiDaiBank() == msg.sender || getPRE() == msg.sender, "requires bank authorization");
		_;
	}

	function issue(address recipient, uint value) public onlyBank {
		_mint(recipient, value);
	}

	function approveFor(address holder, address spender, uint amount) public {
		require(msg.sender == versionController, "can only be invoked by version controller");
		_approve(holder, spender, amount);
	}

	function versionedBalanceOf(address holder, uint version) public view returns (uint){
		return WeiDai(WeiDaiVersionController(versionController).getWeiDai(version)).balanceOf(holder);
	}

	function approveArson(address arsonist, uint value) public {
		arsonAllowance[msg.sender][arsonist] = value;
		emit arsonApproved(msg.sender,arsonist,value);
	}

	function getArsonAllowance (address arsonist, address holder) public view returns (uint){
		return arsonAllowance[holder][arsonist];
	}

	function burn (address holder, uint value) external {
		bool canBurn = holder == msg.sender ||
					getArsonAllowance(msg.sender,holder) >= value ||
					getWeiDaiBank() == msg.sender ||
		getPRE() == msg.sender;

		require(canBurn, "unauthorized to burn WeiDai");
		require(balanceOf(holder)>=value,"insufficient funds.");
		if(getArsonAllowance(msg.sender,holder) >= value){
			arsonAllowance[holder][msg.sender] -= value;
		}

		uint valueToBurn = value;
		if(msg.sender != getWeiDaiBank()){
			uint donationFee = PatienceRegulationEngine(getPRE()).getDonationSplit(holder);
			uint donation = donationFee.mul(value).div(100);
			if(donation>0){
				_transfer(holder, getWeiDaiBank(),donation);
			}
			valueToBurn = value.sub(donation);
		}
		_burn(holder, valueToBurn);
		emit weiDaiBurnt(msg.sender, holder, value);
	}

	function name() public pure returns (string memory) {
		return "WeiDai";
	}

	function symbol() public pure returns (string memory) {
		return "WEIDAI";
	}

	function decimals() public pure returns (uint8) {
		return 18;
	}

	event arsonApproved (address msgsender, address arsonist, uint value);
	event weiDaiBurnt(address indexed burner, address holder, uint value);
}