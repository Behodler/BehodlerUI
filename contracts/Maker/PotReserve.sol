pragma solidity >=0.5.0 <0.6.0;
import "./PotLike.sol";
import "../baseContracts/ReserveLike.sol";
import "../../node_modules/openzeppelin-solidity/contracts/ownership/Secondary.sol";
import "../../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";

contract PotReserve is Secondary, ReserveLike{
	address potAddress;
	address daiAddress;
	bool enabled;

	function enable(bool e) public onlyPrimary {
		enabled = e;
	}

	constructor () public{
		enabled = true;
	}

	function setMakerAddresses(address pot, address dai) public onlyPrimary {
		potAddress = pot;
		daiAddress = dai;
	}

	function deposit (uint dai) public onlyBank {
		require(enabled,"reserve disabled");
		ERC20(daiAddress).transferFrom(msg.sender,address(this),dai);
		ERC20(daiAddress).approve(potAddress,dai);
		PotLike(potAddress).join(dai);
	}

	function withdraw(uint dai) public onlyBank{
		PotLike(potAddress).exit(dai);
		ERC20(daiAddress).transfer(msg.sender,dai);
	}

	function balance() public view returns (uint) {
		return PotLike(potAddress).pie(address(this));
	}

	function transferToNewReserve(address reserve) public onlyPrimary {
		uint potBalance = balance();
		if(potBalance>0)
			PotLike(potAddress).exit(potBalance);

		uint daiBalance = ERC20(daiAddress).balanceOf(address(this));
		ERC20(daiAddress).transfer(reserve,daiBalance);
	}
}
