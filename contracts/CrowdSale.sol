pragma solidity ^0.4.11;

import "./admin/Haltable.sol";

import "./token/ExoCoin.sol";
import "./ExoCoinPricingStrategy.sol";

import "./libs/SafeMath.sol";

contract CrowdSale is Haltable {

	using SafeMath for uint256;

    uint256 public startAt;
    uint256 public duration;

    //goals in dollars
    uint256 public firstGoal;
    uint256 public secondGoal;
    uint256 public thirdGoal;

    address beneficiary;

    uint256 public totalInvested;
    uint256 public investorsCount;

    mapping (address => uint256) balances;

	enum States { None, FirstFunding, SecondFunding, ThirdFunding, Success, Fail}

	ExoCoin public token = new ExoCoin();

	ExoCoinPricingStrategy pricingStrategy;
	ConvertingStrategy convertingStrategy;

	event Invested(address indexed _investor, uint256 _value);	

	function CrowdSale(
			uint256 _start, 
			uint256 _duration, 
			uint256 _firstGoal, 
			uint256 _secondGoal, 
			uint256 _thidrGoal, 
			address _beneficiary) {

		startAt = _start;
		duration = _duration;

		firstGoal = _firstGoal;
		secondGoal = _secondGoal;
		thirdGoal = _thirdGoal;

		beneficiary = _beneficiary;

		totalInvested = 0;
		investorsCount = 0;
	}	

	function () payable {
		require(getState() == States.FirstFunding || getState() == States.SecondFunding || getState() == States.ThirdFunding);

		if(balances[msg.sender] == 0){
			balances[msg.sender] = msg.value;
			investorsCount = investorsCount.add(1);
		}
		else{
			balances[msg.sender] = balances[msg.sender].add(msg.value);
		}

		uint256 amount = pricingStrategy.calculatePrice(msg.value);

		totalInvested = totalInvested.add(msg.value);
		token.mint(msg.sender, amount);

		Invested(msg.sender, msg.value);
	} 

	function withdraw() returns(bool ok){
		require(getState() == States.Fail);
		require(balances[msg.sender] > 0);

		uint256 amount = balances[msg.sender];
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
		if(now >= startAt && now <= startAt + duration) {
			if(totalInvested < convertToEther(firstGoal)) return States.FirstFunding;
			if(totalInvested < convertToEther(secondGoal)) return States.SecondFunding;
			if(totalInvested < convertToEther(thirdGoal)) return States.ThirdFunding;
		} 
		if(now > startAt + duration && totalInvested >= goal) return States.Success;
		if(now > startAt + duration && totalInvested < goal) return States.Fail;
	}
}

