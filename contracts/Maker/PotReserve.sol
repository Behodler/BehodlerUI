pragma solidity >=0.5.0 <0.6.0;
import "./PotLike.sol";
import "../baseContracts/ReserveLike.sol";
import "../../node_modules/openzeppelin-solidity/contracts/ownership/Secondary.sol";
import "../../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "./VatLike.sol";

contract PotReserve is Secondary, ReserveLike{
	address potAddress;
	address daiAddress;
	address vatAddress;
	bool enabled;
	PotLike pot;
	uint256 constant RAY = 10 ** 27;

	function mul(uint x, uint y) internal pure returns (uint z) {
		require(y == 0 || (z = x * y) / y == x, "mul-overflow");
	}

	function enable(bool e) public onlyPrimary {
		enabled = e;
	}

	constructor () public{
		enabled = true;
	}

	function approveForTesting() public onlyPrimary {
		require(potAddress!=address(0),"pot address not set");
		ERC20(daiAddress).approve(potAddress,uint(-1));
	}

	function setMakerAddresses(address p, address d, address v) public onlyPrimary {
		if(potAddress != address(0)){
			VatLike(v).nope(potAddress);
		}
		potAddress = p;
		daiAddress = d;
		vatAddress = v;
		VatLike(v).hope(p);
		pot = PotLike(potAddress);
	}

	function deposit (uint dai) public onlyBank {
		require(enabled,"reserve disabled");
		pot.drip();
		require(ERC20(daiAddress).transferFrom(msg.sender,address(this),dai),"transfer failed");
		pot.join(mul(dai, RAY) / pot.chi());
	}

	function withdraw(uint dai) public onlyBank{
		require(enabled,"reserve disabled");
		pot.drip();
		uint sliceOfPie = mul(dai, RAY) / pot.chi(); //portion of pie in normalized units to draw
		require (pot.pie(address(this)) >= sliceOfPie,"insufficient reserve");
		pot.exit(sliceOfPie);
		ERC20(daiAddress).transfer(msg.sender,dai);
	}

	function balance() public view returns (uint) { //returns dai value in pot
		uint sliceOfPie = pot.pie(address(this));
		return mul(sliceOfPie, pot.chi())/RAY;
	}

	function transferToNewReserve(address reserve) public onlyPrimary {
		pot.drip();
		pot.exit(pot.pie(address(this)));
		uint daiBalance = ERC20(daiAddress).balanceOf(address(this));
		require(ERC20(daiAddress).transfer(reserve,daiBalance),"transferToNewReserve failed at Dai transfer");
	}
}
