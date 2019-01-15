pragma solidity ^0.5.0;
import "../node_modules/openzeppelin-solidity/contracts/ownership/Secondary.sol";
import "../node_modules/openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";
import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";
import "./Updai.sol";

contract Generator is Secondary{
	address DaiAccount;
	address UpdaiAccount;	
	address Vault;
	using SafeMath for uint256;
	address self;

	function contructor () public {
		self = address(this);
	}

	function setVault (address vault) public onlyPrimary {
		Vault = vault;
	}

	function setDependencies (address updai, address dai) public onlyPrimary {
		UpdaiAccount = updai;
		DaiAccount = dai;
	} 

	function getExchangeRate() public view returns (uint) { //exhange rate times 100
		uint balanceOfDai = ERC20(DaiAccount).balanceOf(self).mul(100);
		uint totalUpdai = ERC20(UpdaiAccount).totalSupply();
		if(balanceOfDai == 0 || totalUpdai == 0){
			return 100;
		}
		uint exchangeRate = balanceOfDai.div(totalUpdai);
		return exchangeRate > 1 ? exchangeRate : 1;
	}

	function mintUpdai(uint dai) public {
		uint updaiToMint = dai.mul(100)/getExchangeRate();
		require (ERC20(DaiAccount).allowance(msg.sender,self)>=dai, "Generator contract unauthorized to take Dai");
		Updai(UpdaiAccount).issue(msg.sender,updaiToMint);
	}

	function redeemDai(uint updai) public {
		uint updaiToTradeIn = updai.mul(90).div(100);//10% fee
		require(ERC20(UpdaiAccount).totalSupply()<=updai, "redemption amount exceeeds total updai supply");
		require (ERC20(UpdaiAccount).allowance(msg.sender,self)>=updai, "Generator contract unauthorized to take updai");
		uint daiToRedeem = updaiToTradeIn.mul(getExchangeRate()).div(100);
		require(daiToRedeem<=ERC20(DaiAccount).balanceOf(self), "dai request exceeds total reserves of dai");
		Updai(UpdaiAccount).burn(msg.sender,updai);
		ERC20(DaiAccount).transfer(msg.sender,daiToRedeem);
		if(updai>100)
			Updai(UpdaiAccount).issue(Vault,updai/100);
	}
}