pragma solidity ^0.4.20;
import "../node_modules/openzeppelin-solidity/contracts/ownership/Secondary.sol";

contract Generator is Secondary{
	address DAIaccount;

	function setDAIAddress (address dai) public onlyPrimary {
		DAIaccount = dai;
	} 

	//TODO: check if approved and then generate. Also keep track of exchange rate 
}