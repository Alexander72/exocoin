pragma solidity ^0.4.11;

/**
 * Interface for defining crowdsale pricing.
 */
contract PricingStrategy {
	/**
	 * When somebody tries to buy tokens for X eth, calculate how many tokens they get.
	 *
	 *
	 * @param value - What is the value of the transaction send in as wei
	 * @param weiRaised - how much money has been raised this far in the main token sale - this number excludes presale
	 * @param tokensSold - how much tokens have been sold this far
	 * @param msgSender - who is the investor of this transaction
	 * @param decimals - how many decimal units the token has
	 * @return Amount of tokens the investor receives
	 */
	function calculatePrice(uint value, uint256 weiRaised, uint256 tokensSold, address msgSender, uint decimals) public constant returns (uint256 tokenAmount);
}