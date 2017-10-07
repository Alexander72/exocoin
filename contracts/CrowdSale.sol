pragma solidity ^0.4.11;

import "./admin/Haltable.sol";

import "./token/ExoCoin.sol";

import "./PricingStrategy.sol";
import "./ConvertingStrategy.sol";

import "./libs/SafeMath.sol";

contract CrowdSale is Haltable {

	using SafeMath for uint256;

    uint256 public startAt;
    uint256 public finishAt;

    address beneficiary;

    uint public currentStageIndex;

    //goals in ethers
    uint256[] public stageGoal;

    mapping (uint => mapping(address => uint256)) public withdrawAmount;
    mapping (uint => mapping(address => uint256)) public stageInvested;
    uint[] public stageFinalized;


    uint256 public totalInvested;
    uint256 public investorsCount;

	ExoCoin public token = new ExoCoin();

	PricingStrategy pricingStrategy;
	ConvertingStrategy convertingStrategy;

	event Invested(address indexed _investor, uint256 _value);	
	event StageFinalized(uint _stageIndex, uint256 _stageInvested);
	event Withdrawed(address withdrawer, uint256 amount);

	function CrowdSale(
			uint256 _start, 
			uint256 _duration,
			address _beneficiary,
			uint256[] _stageGoal,
			uint256 _weiInOneDollar) {

		startAt = _start;
		finishAt = startAt + _duration;

		beneficiary = _beneficiary;

		totalInvested = 0;
		investorsCount = 0;

		convertingStrategy = new ConvertingStrategy(_weiInOneDollar);
		pricingStrategy = new PricingStrategy();		

		currentStageIndex = 0;
		for(uint i = 0; i < _stageGoal.length; i++) {
			stageGoal[i] = convertingStrategy.dollarsToWei(_stageGoal[i]);
			stageFinalized[i] = false;
		}
	}	

	function () payable {
		require(canInvest());

		uint256 amount = msg.value;
		uint256 realAmounted = 0;

		totalInvested = totalInvested.add(amount);

		realAmounted = processPayment(amount, msg.sender);

		uint256 tokenAmount = pricingStrategy.calculatePrice(realAmounted);
		token.mint(msg.sender, tokenAmount);

		Invested(msg.sender, realAmounted);
	} 

	/*
	* 	Этот метод возвращает сумму, которые по факту принял контракт
	*	(остальное по идее должно быть доступно для снятия).
	*	Пока этот метод возвращет столько же, сколько и отправил пользователь,
	*	но в дальнейшем это может измениться.
	*	Не уверен, но мне кажется, что в этом методе не стоит делать 
	* 	продажу токенов или другие внешние вызовы,
	*	для этого стоит пользоваться возвращаемым значением.
	*	@TODO сделать пересчет контрольной суммы этапа зависимым от курса.
	*/
	private processPayment(uint256 _value, address sender) returns (uint256) {
		uint256 overflow = 0;
		uint256 value = _value;

		uint i = currentStageIndex;

		//обрабатываем ситуацию, когда последний этап еще не выполнен(stageGoal[i] != 0) и
		//текущая сумма переведет нас на новый этап
		if(stageGoal[i] != 0 && totalInvested.add(value) >= stageGoal[i]) {

			//изменяем внутреннее состояние контракта
			currentStageIndex = currentStageIndex.add(1);
			//считаем превышение над текущей целью
			overflow = totalInvested.add(value).sub(stageGoal[i]);
			//считаем текущее значение
			value = value.sub(overflow);
			//прибавляем текущее значение к общей сумме начислений
			totalInvested = totalInvested.add(value);
			//прибавляем текущее значение к сумме начислений в прошедшем этапе
			//необходимо для вывода средств.
			stageInvested[i] = stageInvested[i].add(value);

			//пока не знаю, как компилятор отнесется к увеличению несущестующей переменной.
			//внутри вызова этого же метода далее, поэтому создам-ка я ее.
			withdrawAmount[currentStageIndex][sender] = 0;
			stageInvested[currentStageIndex] = 0;

			//заканчиваем пройденный этап
			finalizeStage(i);

			//рекуксивно вызываем эту же функцию на тот случай,
			//если сумма текущего платежа переведет сразу через один или более этапов
			//В этом случае, можно не запоминать, сколько в уже прошлом этапе
			//начислил пользователь, потому что он все равно их уже снять обратно не сможет.
			return value + processPayment(overflow, sender);
		} else {
			//прибавляем текущее значение к общей сумме начислней
			totalInvested = totalInvested.add(value);
			//прибавляем текущее значение к сумме начислений в прошедшем этапе
			//необходимо для вывода средств.
			stageInvested[i] = stageInvested[i].add(value);

			//увеличиваем разрешенную для снятия сумму в текущем этапе			
			// Тут необходимо при каждом переходе в новый этап 
			// заносить значение в только что обновленный индекс currentStageIndex
			// тем самым имитируя обнуление начислений всех остальных пользователей
			withdrawAmount[currentStageIndex][sender] = withdrawAmount[currentStageIndex][sender].add(value);

			return value;
		}
	}

	private function finalizeStage(uint i) {
		require(now > startAt);
		require(currentStageIndex > 0);
		require(totalInvested == stageGoal[currentStageIndex.sub(1)]);
		require(stageFinalized[currentStageIndex.sub(1)]);

		stageFinalized[currentStageIndex.sub(1)] = true;

		beneficiary.send(stageInvested[i]);

		StageFinalized(i, stageInvested[i]);
	}

	public function withdraw() returns(bool){
		require(canWithdraw());

		uint256 amount = withdrawAmount[currentStageIndex][msg.sender];
		withdrawAmount[currentStageIndex][msg.sender] = 0;

		msg.sender.transfer(amount);

		Withdrawed(msg.sender, amount);
		
		return true;
	}

	public function canInvest() returns(bool) {
		if(now >= startAt && now <= finishAt)
			return true;

		return false;
	}

	public function canWithdraw() returns(bool) {
		if(now > finishAt && withdrawAmount[currentStageIndex][msg.sender] > 0)
			return true;

		return false;
	}
}

