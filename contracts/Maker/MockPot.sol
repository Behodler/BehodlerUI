pragma solidity >=0.5.0 <0.6.0;
import "./PotLike.sol";
import "../../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";

contract MockPot is PotLike{
	uint depositBlock;
	address daiAddress;
	uint depositValue;
	uint minBlocksBeforeGrowth = 5;

	function setDaiAddress(address dai) public {
		daiAddress = dai;
	}

	function join(uint wad) external{
		ERC20(daiAddress).transferFrom(msg.sender,address(this),wad);
		depositBlock = block.number;
		pie[msg.sender] = wad;
	}

	function mockGrow(address addressToGrow) public {
		if(depositBlock + minBlocksBeforeGrowth > block.number)
			return;
		uint growth = block.number - depositBlock;
		pie[addressToGrow] = pie[addressToGrow] * (100 + growth) / 100;
		depositBlock = block.number+1;
	}

	function exit(uint wad) external {
		mockGrow(msg.sender);
		require(pie[msg.sender]>=wad, "insufficient funds");
		pie[msg.sender] -= wad;
		ERC20(daiAddress).transfer(msg.sender, wad);
	}
}