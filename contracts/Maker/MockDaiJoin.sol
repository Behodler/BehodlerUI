pragma solidity >=0.5.0 <0.6.0;
import "./VatLike.sol";
import "./GemLike.sol";
import "./DaiJoinLike.sol";

contract MockDaiJoin is DaiJoinLike {
	VatLike _vat;
	GemLike _dai;
	function setMakerAddresses(address v, address d) public {
		_vat = VatLike(v);
		_dai = GemLike(d);
	}

	function vat() public returns (VatLike){
		return _vat;
	}
	function dai() public returns (GemLike){
		return _dai;
	}

	function join(address, uint) public payable {

	}

	function exit(address, uint) public {

	}
}