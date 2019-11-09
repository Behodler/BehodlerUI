
pragma solidity >=0.5.0 <0.6.0;

contract VatLike{
	function hope(address usr) external;
	function nope(address usr) external;
	function can(address, address) public view returns (uint);
}