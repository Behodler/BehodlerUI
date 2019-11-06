pragma solidity >=0.5.0 <0.6.0;
import "../../node_modules/openzeppelin-solidity/contracts/ownership/Secondary.sol";

contract ReserveLike is Secondary{
	address internal bank;
	function setBank(address b) public onlyPrimary{
		bank = b;
	}

	modifier onlyBank() {
		require(msg.sender == bank, "only the bank can invoke this function");
		_;
	}

	function deposit (uint dai) public;
	function withdraw(uint dai) public;
	function balance() public view returns (uint);
	function transferToNewReserve(address reserve) public;
}