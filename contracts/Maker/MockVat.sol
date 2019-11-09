pragma solidity >=0.5.0 <0.6.0;

contract MockVat {
	mapping(address=>mapping(address=>uint)) public can;
	function hope(address usr) external{
		can[msg.sender][usr] = 1;
	}

	function nope(address usr) external{
		can[msg.sender][usr] = 0;
	}
}