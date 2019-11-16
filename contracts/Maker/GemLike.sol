pragma solidity >=0.5.0 <0.6.0;
contract GemLike {
	function approve(address, uint) public;
	function transfer(address, uint) public;
	function transferFrom(address, address, uint) public;
	function deposit() public payable;
	function withdraw(uint) public;
}