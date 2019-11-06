//Interface to interact with the Maker Pot contract which implements the DSR
pragma solidity >=0.5.0 <0.6.0;
/*
   "Savings Dai" is obtained when Dai is deposited into
   this contract. Each "Savings Dai" accrues Dai interest
   at the "Dai Savings Rate".

   This contract does not implement a user tradeable token
   and is intended to be used with adapters.

         --- `save` your `dai` in the `pot` ---

   - `dsr`: the Dai Savings Rate
   - `pie`: user balance of Savings Dai

   - `join`: start saving some dai
   - `exit`: remove some dai
   - `drip`: perform rate collection

*/

contract PotLike {
	mapping (address => uint256) public pie;  // user Savings Dai
	function join(uint wad) external; // deposit into pot
	function exit(uint wad) external;	//withdraw
}