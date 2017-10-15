pragma solidity ^0.4.11;

import "../libs/SafeMath.sol";
import "../admin/Ownable.sol";

contract ConvertingStrategy is Ownable {

	using SafeMath for uint256;

	uint256 public weiInOneDollar;

	function ConvertingStrategy (uint256 _weiInOneDollar) {
		weiInOneDollar = _weiInOneDollar;
	}	

	function setWeiInOneDollar(uint256 _weiInOneDollar) onlyOwner returns(bool){
		weiInOneDollar = _weiInOneDollar;

		return true;
	}

	function weiToDollars(uint256 _wei) constant returns(uint256) {
		return _wei.div(weiInOneDollar);
	}

	function dollarsToWei(uint256 dollars) constant returns(uint256) {
		return dollars.mul(weiInOneDollar);
	}
}
