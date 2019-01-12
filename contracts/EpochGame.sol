pragma solidity ^0.4.20;
import "../node_modules//openzeppelin-solidity/contracts/ownership/Secondary.sol";
import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

/*
* last person to burn gets 60%
* if the last burn < previous then timer has 30 mins added to clock. 
* if higher, nothing added to clock.
 */
contract EpochGame is Secondary {
	uint epochDuration;
	uint currentEpoch;
	uint currentEpochBlock;
	using SafeMath for uint256;

	constructor () public {
		currentEpochBlock = block.number;
	}

	function setEpochDuration (uint blocks) public onlyPrimary{
		epochDuration = blocks;
	}

	function getCurrentEpoch() public returns (uint) {
		uint blocksSinceLastEpoch = block.number.sub(currentEpochBlock);
		if(blocksSinceLastEpoch < epochDuration)
			return currentEpoch;
		
		uint epochsElapsed = blocksSinceLastEpoch.div(currentEpochBlock);
		currentEpoch = currentEpoch.add(epochsElapsed);
		currentEpochBlock = currentEpochBlock.add(epochsElapsed.mul(epochDuration));
	}

}