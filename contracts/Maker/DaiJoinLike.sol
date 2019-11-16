pragma solidity >=0.5.0 <0.6.0;
import "./VatLike.sol";
import "./GemLike.sol";

contract DaiJoinLike {
	function vat() public returns (VatLike);
	function dai() public returns (GemLike);
	function join(address, uint) public payable;
	function exit(address, uint) public;
}