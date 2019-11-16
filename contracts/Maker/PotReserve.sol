pragma solidity >=0.5.0 <0.6.0;
import "./PotLike.sol";
import "../baseContracts/ReserveLike.sol";
import "../../node_modules/openzeppelin-solidity/contracts/ownership/Secondary.sol";
import "../../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "./VatLike.sol";
import "./DaiJoinLike.sol";

contract PotReserve is Secondary, ReserveLike{
	address potAddress;
	address daiAddress;
	address vatAddress;
	address daiJoinAddress;
	bool enabled;
	PotLike pot;
	VatLike vat;
	DaiJoinLike daijoin;
	uint constant RAY = 10 ** 27;

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
		daijoin.dai().approve(potAddress,uint(-1));
	}

	function setMakerAddresses(address p, address d, address j) public onlyPrimary {
		potAddress = p;
		daiAddress = d;
		daiJoinAddress = j;

		daijoin = DaiJoinLike(j);
		pot = PotLike(p);
	}

	function daiJoin_join(address urn, uint wad) public {
		// Gets DAI from the user's wallet
		daijoin.dai().transferFrom(msg.sender, address(this), wad);
		// Approves adapter to take the DAI amount
		daijoin.dai().approve(daiJoinAddress, wad);
		// Joins DAI into the vat
		daijoin.join(urn, wad);
	}

	function deposit (uint dai_wad) public onlyBank {
		require(enabled,"reserve disabled");
		vat = daijoin.vat();
		uint chi = pot.drip();
		daiJoin_join(address(this), dai_wad);

		if(vat.can(address(this), potAddress) == 0) {
			vat.hope(potAddress);
        }

		uint wad = mul(dai_wad, RAY)/chi;
		pot.join(wad);
	}

	function withdraw(uint dai_wad) public onlyBank returns (uint exitAmount){
		require(enabled,"reserve disabled");
		vat = daijoin.vat();
		uint chi = pot.drip();
		uint sliceOfPie = mul(dai_wad, RAY) / chi;

		require (pot.pie(address(this)) >= sliceOfPie,"insufficient reserve");
		pot.exit(sliceOfPie);

		uint bal = daijoin.vat().dai(address(this));
        // Allows adapter to access to proxy's DAI balance in the vat
		if (vat.can(address(this), address(daiJoinAddress)) == 0) {
			vat.hope(daiJoinAddress);
        }
        // It is necessary to check if due rounding the exact wad amount can be exited by the adapter.
        // Otherwise it will do the maximum DAI balance in the vat
		exitAmount = bal >= mul(dai_wad, RAY) ? dai_wad : bal / RAY;
		daijoin.exit(
            msg.sender,
            exitAmount
		);
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
