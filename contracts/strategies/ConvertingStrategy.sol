pragma solidity ^0.4.11;

import "../libs/SafeMath.sol";

contract ConvertingStrategy {
	
	using SafeMath for uint256;

	uint256 weiInOneDollar;

	function ConvertingStrategy (uint256 _weiInOneDollar) {
		weiInOneDollar = _weiInOneDollar;
	}	

	function weiToDollars(uint256 wei) constant returns(uint256) {
		return wei.div(weiInOneDollar);
	}

	function dollarsTowei(uint256 dollars) constant returns(uint256) {
		return wei.mul(weiInOneDollar);
	}
}
