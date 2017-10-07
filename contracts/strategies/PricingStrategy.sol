pragma solidity ^0.4.11;

import "../libs/SafeMath.sol";

contract PricingStrategy {
	using SafeMath for uint256;

	function calculatePrice(uint256 value) public constant returns (uint256 tokenAmount) {
		return value.mul(2);
	}
}
