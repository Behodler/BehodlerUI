pragma solidity >=0.5.0 <0.6.0;
import "./baseContracts/ReserveLike.sol";
import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";

contract InertReserve is Secondary, ReserveLike{

	address daiAddress;
	function setDaiAddress(address d) public onlyPrimary {
		daiAddress = d;
	}

	function deposit (uint dai) public onlyBank {
		require(ERC20(daiAddress).transferFrom(msg.sender,address(this),dai), "deposit failed on transfer");
	}

	function withdraw(uint dai) public onlyBank {
		require(ERC20(daiAddress).transfer(msg.sender,dai), "deposit failed on transfer");
	}

	function balance() public view returns (uint) {
		return ERC20(daiAddress).balanceOf(address(this));
	}

	function transferToNewReserve(address reserve) public {
		uint daiBalance = ERC20(daiAddress).balanceOf(address(this));
		require(ERC20(daiAddress).transfer(reserve,daiBalance),"transferToNewReserve failed at Dai transfer");
	}
}