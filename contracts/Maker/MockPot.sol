pragma solidity >=0.5.0 <0.6.0;
import "./PotLike.sol";
import "../../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";

contract MockPot is PotLike{
	address dai;
    mapping (address => uint256) public pie;  // user Savings Dai

    uint256 public Pie;  // total Savings Dai
    uint256 public dsr;  // the Dai Savings Rate
    uint256 public chi;  // the Rate Accumulator

    address public vow;  // debt engine
    uint256 public rho;  // time of last drip

    uint256 public live;  // Access Flag

    // --- Init ---
    constructor() public {
        dsr = (ONE*108)/100;
        chi = ONE;
        rho = now;
        live = 1;
    }
 
    // --- Math ---
    uint256 constant ONE = 10 ** 27;//Also RAY
	uint256 constant RAD = 10 ** 45;//Also RAY
    function rpow(uint x, uint n, uint base) internal pure returns (uint z) {
        assembly {
            switch x case 0 {switch n case 0 {z := base} default {z := 0}}
            default {
                switch mod(n, 2) case 0 { z := base } default { z := x }
                let half := div(base, 2)  // for rounding.
                for { n := div(n, 2) } n { n := div(n,2) } {
                    let xx := mul(x, x)
                    if iszero(eq(div(xx, x), x)) { revert(0,0) }
                    let xxRound := add(xx, half)
                    if lt(xxRound, xx) { revert(0,0) }
                    x := div(xxRound, base)
                    if mod(n,2) {
                        let zx := mul(z, x)
                        if and(iszero(iszero(x)), iszero(eq(div(zx, x), z))) { revert(0,0) }
                        let zxRound := add(zx, half)
                        if lt(zxRound, zx) { revert(0,0) }
                        z := div(zxRound, base)
                    }
                }
            }
        }
    }
	function setDaiAddress(address d) public {
		dai = d;
	}

    function rmul(uint x, uint y) internal pure returns (uint z) {
        z = mul(x, y) / ONE;
    }

	function radmul(uint x, uint y) internal pure returns (uint z) {
        z = mul(x, y) / RAD;
    }

    function add(uint x, uint y) internal pure returns (uint z) {
        require((z = x + y) >= x);
    }

    function sub(uint x, uint y) internal pure returns (uint z) {
        require((z = x - y) <= x);
    }

    function mul(uint x, uint y) internal pure returns (uint z) {
        require(y == 0 || (z = x * y) / y == x);
    }


    // --- Savings Rate Accumulation ---
    function drip() external returns (uint tmp) {
        require(now >= rho, "Pot/invalid-now");
	 	tmp = rmul(rpow(dsr, now - rho, ONE), chi);
        chi = tmp;
        rho = now;
       // vat.suck(address(vow), address(this), mul(Pie, chi_));
    }

    // --- Savings Dai Management ---
    function join(uint wad) external {
        require(now == rho, "Pot/rho-not-updated");
        pie[msg.sender] = add(pie[msg.sender], wad);
        Pie             = add(Pie,             wad);
		require(ERC20(dai).transferFrom(msg.sender,address(this),rmul(chi, wad)),"join failed at Dai transfer");
        //vat.move(msg.sender, address(this), mul(chi, wad));
    }

    function exit(uint wad) external {
        pie[msg.sender] = sub(pie[msg.sender], wad);
        Pie             = sub(Pie,             wad);
		require(ERC20(dai).transfer(msg.sender,rmul(chi, wad)), "exit failed at Dai transfer");
      //  vat.move(address(this), msg.sender, mul(chi, wad));
    }
}