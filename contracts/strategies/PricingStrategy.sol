pragma solidity ^0.4.11;

import "../libs/SafeMath.sol";
import "../admin/Ownable.sol";

contract PricingStrategy {
	using SafeMath for uint256;

	uint256 public weiInOneToken;

	function PricingStrategy(uint256 _weiInOneToken) {
		require(_weiInOneToken > 0);

		weiInOneToken = _weiInOneToken;
	}

	function setWeiInOneToken(uint256 _weiInOneToken) onlyOwner returns(bool) {
		if(_weiInOneToken > 0) {
			weiInOneToken = _weiInOneToken;

			return true;
		}

		return false;
	}

	function calculateTokenAmount(uint256 valueInWei) public constant returns(uint256) {
		return valueInWei.div(weiInOneToken);
	}
}
