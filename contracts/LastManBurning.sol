pragma solidity ^0.5.0;
import "./EpochGame.sol";
import "../node_modules//openzeppelin-solidity/contracts/ownership/Secondary.sol"; 
import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./Updai.sol";

//winner gets 100% of own burn plus 50% of runner up. Everyone else is refunded.
contract LastManBurning is EpochGame() { //remember to make a bank of Updai
	event Winner(uint epoch, address winner, address runnerUp, uint winnings);
	address UpdaiAccount;
	mapping(uint => address[]) highestContestantsPerEpoch; //0 == highest
	mapping (uint => uint[]) highestEntriesPerEpoch;  // 0 == highest
	address self;
	function contructor () public {
		self = address(this);
	}

	function enter(uint updai) public {
		_enter(updai, msg.sender);
		if(highestContestantsPerEpoch[currentEpoch].length == 0){
			highestEntriesPerEpoch[currentEpoch].push(updai);
			highestEntriesPerEpoch[currentEpoch].push(updai);
			highestContestantsPerEpoch[currentEpoch].push(msg.sender);
			highestContestantsPerEpoch[currentEpoch].push(msg.sender);
		}else{
			require (updai > highestEntriesPerEpoch[currentEpoch][0]," entry must be higher than previous contestants");
			highestContestantsPerEpoch[currentEpoch][1] = highestContestantsPerEpoch[currentEpoch][0];
			highestEntriesPerEpoch[currentEpoch][1] = highestEntriesPerEpoch[currentEpoch][1];
			highestContestantsPerEpoch[currentEpoch][0] = msg.sender;
			highestEntriesPerEpoch[currentEpoch][0] = updai;
		}
	}

	function concludeNextEpoch() public {
		uint nextEpoch = lastEpochSettled + 1;
		require(nextEpoch < currentEpoch, "cannot settle current epoch");
		lastEpochSettled = nextEpoch;
		if (highestContestantsPerEpoch[nextEpoch].length == 0 ){
			return;
		}

		if(highestContestantsPerEpoch[nextEpoch][0] == highestContestantsPerEpoch[nextEpoch][1]){
			return;
		}

		uint winningBonus = highestEntriesPerEpoch[nextEpoch][1].div(2);
		winners[highestContestantsPerEpoch[nextEpoch][0]] = winners[highestContestantsPerEpoch[nextEpoch][0]].add(winningBonus);
		Updai(UpdaiAccount).burn(self,winningBonus);
		emit Winner(nextEpoch,highestContestantsPerEpoch[nextEpoch][0],highestContestantsPerEpoch[nextEpoch][1],winningBonus);
	}
}