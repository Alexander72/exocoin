pragma solidity ^0.4.11;

import "./Ownable.sol";

import "./token/ExoCoin.sol";
import "./ExoCoinPricingStrategy.sol";

import "./math/SafeMath.sol";

contract CrowdSale is Ownable {

	using SafeMath for uint256;

    uint public startAt;
    uint public duration;
    uint256 public goal;

    address beneficiary;

    uint256 public totalInvested;
    uint256 public investorsCount;

    address owner;

    mapping (address => uint256) balances;

	enum States { None, Funding, Success, Fail}
	bool finalized = false;

	ExoCoin public token = new ExoCoin();
	ExoCoinPricingStrategy pricingStrategy;

	event Invested(address _investor, uint256 _value);
	
	        

	function CrowdSale () {
		owner = msg.sender;

		startAt = now;
		duration = 30 minutes;
		goal = 2 ether;
		beneficiary = msg.sender;

		totalInvested = 0;
		investorsCount = 0;
	}	

	function () payable {
		require(getState() == States.Funding);

		if(balances[msg.sender] == 0){
			balances[msg.sender] = msg.value;
			investorsCount++;
		}
		else{
			balances[msg.sender] = balances[msg.sender] + msg.value;
		}

		uint256 amount = pricingStrategy.calculatePrice(msg.value, 0, 0, address(0), 0);

		totalInvested = totalInvested.add(msg.value);
		token.mint(msg.sender, amount);

		Invested(msg.sender, amount);
	} 

	function withdraw() returns(bool ok){
		require(getState() == States.Fail);
		require(balances[msg.sender] > 0);

		uint amount = balances[msg.sender];
		balances[msg.sender] = 0;

		msg.sender.transfer(amount);
		return true;
	}

	function finalize() returns(bool ok) {
		require(getState() == States.Success);
		require(!finalized);

		finalized = true;

		beneficiary.transfer(this.balance);
	}

	function getState() public constant returns (States) {
		if(now < startAt) return States.None;
		if(now >= startAt && now <= startAt + duration) return States.Funding;
		if(now > startAt + duration && totalInvested >= goal) return States.Success;
		if(now > startAt + duration && totalInvested < goal) return States.Fail;
	}
}

