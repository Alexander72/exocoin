pragma solidity ^0.4.11;

import "./libs/SafeMath.sol";

contract ExoCoinPricingStrategy is PricingStrategy {

	function calculatePrice(uint256 value) public constant returns (uint256 tokenAmount) {
		return value.mul(2);
	}
}
