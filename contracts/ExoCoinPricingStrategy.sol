pragma solidity ^0.4.11;

import "./PricingStrategy.sol";
import "./math/SafeMath.sol";

contract ExoCoinPricingStrategy is PricingStrategy {

	function calculatePrice(
		uint value, 
		uint256 weiRaised, 
		uint256 tokensSold, 
		address msgSender, 
		uint decimals) public constant returns (uint256 tokenAmount)
	{
		uint256 res = value * 2;
	}
}
