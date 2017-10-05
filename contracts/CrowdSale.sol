pragma solidity ^0.4.11;

import "./admin/Haltable.sol";

import "./token/ExoCoin.sol";

import "./PricingStrategy.sol";
import "./ConvertingStrategy.sol";

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
    uint256 public currentStageTotalInvested;

    mapping (address => uint256) balances;
    balances[3] stageBalances;

	enum States { None, FirstFunding, SecondFunding, ThirdFunding, Success, Fail}

	ExoCoin public token = new ExoCoin();

	PricingStrategy pricingStrategy;
	ConvertingStrategy convertingStrategy;
	uint stageAchived;

	event Invested(address indexed _investor, uint256 _value);	

	function CrowdSale(
			uint256 _start, 
			uint256 _duration, 
			uint256 _firstGoal, 
			uint256 _secondGoal, 
			uint256 _thidrGoal, 
			address _beneficiary,
			uint256 _weiInOneDollar) {

		startAt = _start;
		duration = _duration;

		firstGoal = _firstGoal;
		secondGoal = _secondGoal;
		thirdGoal = _thirdGoal;

		beneficiary = _beneficiary;

		totalInvested = 0;
		investorsCount = 0;

		convertingStrategy = new ConvertingStrategy(_weiInOneDollar);
		currentStageTotalInvested = 0;

		stageAchived = 0;
	}	

	function () payable {
		require(getState() == States.FirstFunding || getState() == States.SecondFunding || getState() == States.ThirdFunding);

		//если текущая сумма превышает контрольную точку, то разбиваем сумму
		//на 2 - одна пойдет в завершение текущего этапа, вторая в новый этап
		uint256 overflow = 0;
		uint256 amount = msg.value;
		if(currentStageTotalInvested.add(msg.value) > convertingStrategy.dollarsToWei(goals[stageAchived]))
		{
			overflow = currentStageTotalInvested.add(msg.value).sub(convertingStrategy.dollarsToWei(goals[stageAchived]));
			amount = currentStageTotalInvested.add(msg.value).sub(overflow);
		}

		if(stageBalances[stageAchived][msg.sender] == 0) {
			stageBalances[stageAchived][msg.sender] = msg.value;
			investorsCount = investorsCount.add(1);
		}
		else{
			balances[stageAchived][msg.sender] = balances[stageAchived][msg.sender].add(msg.value);
		}


		totalInvested = totalInvested.add(msg.value);

		if(currentStageTotalInvested.add(msg.value) >)
		currentStageTotalInvested = currentStageTotalInvested.add(msg.value);


		if(totalInvested >= convertingStrategy.dollarsToWei(thirdGoal)) {
			stageAchived(3);
		} else if(totalInvested >= convertingStrategy.dollarsToWei(secondGoal)) {
			stageAchived(2);
		} else if(totalInvested >= convertingStrategy.dollarsToWei(firstGoal)) {
			stageAchived(1);
		}

		uint256 amount = pricingStrategy.calculatePrice(msg.value);
		token.mint(msg.sender, amount);

		Invested(msg.sender, msg.value);
	} 

	public function withdraw() returns(bool ok){
		require(getState() == States.Fail);
		require(balances[msg.sender] > 0);

		uint256 amount = balances[msg.sender];
		balances[msg.sender] = 0;

		msg.sender.transfer(amount);
		return true;
	}

	private stageAchived(uint stage) {
		//checks require

		stageAchived = stage;
		uint amount = currentStageTotalInvested;
		currentStageTotalInvested = 0;

		beneficiary.send(amount);
		StageAchived(stage);
	}

	public function getState() constant returns (States) {		
		if(now < startAt) return States.None;
		if(now >= startAt && now <= startAt + duration) {
			if(stageAchived == 0) return States.FirstFunding;
			if(stageAchived == 1) return States.SecondFunding;
			if(stageAchived == 2) return States.ThirdFunding;
		}
		if(now > startAt + duration && totalInvested >= convertingStrategy.dollarsToWei(thirdGoal)) return States.Success;
		if(now > startAt + duration && totalInvested < convertingStrategy.dollarsToWei(thirdGoal)) return States.Fail;
	}
}

