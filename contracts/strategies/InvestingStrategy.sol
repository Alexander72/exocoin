pragma solidity ^0.4.11;

import "./libs/SafeMath.sol";

contract InvestingStrategy {

	adress crowdSale;

	function InvestingStrategy(address _crowdSale) {
		crowdSale = _crowdSale;
	}

	public function invest(address sender, uint256 amount) {
		
	}
}
