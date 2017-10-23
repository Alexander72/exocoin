pragma solidity ^0.4.11;

import "./admin/Haltable.sol";

import "./token/ExoCoin.sol";

import "./strategies/PricingStrategy.sol";
import "./strategies/ConvertingStrategy.sol";

import "./libs/SafeMath.sol";

contract CrowdSale is Haltable {

	using SafeMath for uint256;

    uint public startAt;
    uint public finishAt;

    address beneficiary;

    uint public currentStageIndex;

    //goals in wei
    uint256[10] public stageGoal;

    //goals in dollars
    uint256[10] public stageGoalInDollar;

    mapping (uint => mapping(address => uint256)) public withdrawAmount;
    uint256[10] public stageInvested;
    bool[10] public stageFinalized;


    uint256 public totalInvested;
    uint256 public investorsCount;

    uint256 public minInvestValue;

	ExoCoin public token = new ExoCoin();

	PricingStrategy public pricingStrategy;
	ConvertingStrategy public convertingStrategy;

	event Invested(address indexed _investor, uint256 _value);	
	event StageFinalized(uint _stageIndex, uint256 _stageInvested);
	event Withdrawed(address withdrawer, uint256 amount);

	function CrowdSale(
			uint _start, 
			uint _finish,
			address _beneficiary,
			uint256[] _stageGoal,
			uint256 _weiInOneDollar,
			uint256 _weiInOneToken,
			uint256 _minInvestValue) payable {

		require(_start >= now);
		require(_finish >= _start);
		require(_beneficiary != address(0));
		require(_weiInOneDollar > 0);
		require(_weiInOneToken > 0);
		require(_stageGoal.length <= 10);
		require(_minInvestValue > 0);

		startAt = _start;
		finishAt = _finish;

		beneficiary = _beneficiary;

		minInvestValue = _minInvestValue;

		totalInvested = 0;
		investorsCount = 0;

		convertingStrategy = new ConvertingStrategy(_weiInOneDollar);
		pricingStrategy = new PricingStrategy(_weiInOneToken);		

		currentStageIndex = 0;
		uint256 prevStageGoal = 0;
		for(uint i = 0; i < _stageGoal.length; i++) {
			require(_stageGoal[i] > prevStageGoal);

			prevStageGoal = _stageGoal[i];

			stageGoal[i] = convertingStrategy.dollarsToWei(_stageGoal[i]);
			stageGoalInDollar[i] = _stageGoal[i];

			stageFinalized[i] = false;
		}
	}

	function setWeiInOneDollar(uint256 _weiInOneDollar) onlyOwner returns(bool) {		
		if(convertingStrategy.setWeiInOneDollar(_weiInOneDollar)) {	

			currentStageIndex = 0;

			for(uint i = 0; i < 10; i++) {
				if(stageGoalInDollar[i] != 0) {

					stageGoal[i] = convertingStrategy.dollarsToWei(stageGoalInDollar[i]);

					if(totalInvested > stageGoal[i]) {
						currentStageIndex = i + 1;

						if(!stageFinalized[i]) {
							finalizeStage(i);
							
						}
					}
					else {					
						stageFinalized[i] = false;
					}
				}
			}
		}
	}

	function setWeiInOneToken(uint256 _weiInOneToken) onlyOwner returns(bool) {		
		return pricingStrategy.setWeiInOneToken(_weiInOneToken);
	}

	function setFinishAt(uint _finish) onlyOwner returns(bool) {		
		finishAt = _finish;

		return true;
	}	

	function () stopInEmergency payable {
		require(canInvest());
		require(msg.value >= minInvestValue);

		uint256 amount = msg.value;
		uint256 realAmounted = 0;

		realAmounted = processPayment(amount, msg.sender);

		uint256 tokenAmount = pricingStrategy.calculateTokenAmount(realAmounted);
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
	function processPayment(uint256 _value, address sender) private returns (uint256) {
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

	function finalizeStage(uint i) private {
		require(now > startAt);
		require(currentStageIndex > 0);
		require(totalInvested == stageGoal[currentStageIndex.sub(1)]);
		require(!stageFinalized[currentStageIndex.sub(1)]);

		stageFinalized[currentStageIndex.sub(1)] = true;

		beneficiary.transfer(stageInvested[i]);

		StageFinalized(i, stageInvested[i]);
	}

	function withdraw() stopInEmergency public returns(bool) {
		require(canWithdraw());

		uint256 amount = withdrawAmount[currentStageIndex][msg.sender];
		withdrawAmount[currentStageIndex][msg.sender] = 0;

		msg.sender.transfer(amount);

		Withdrawed(msg.sender, amount);

		return true;
	}

	function canInvest() public constant returns(bool) {
		if(now >= startAt && now <= finishAt) {
			return true;
		}

		return false;
	}

	function canWithdraw() public constant returns(bool) {
		if(now > finishAt && withdrawAmount[currentStageIndex][msg.sender] > 0) {
			return true;
		}

		return false;
	}
}

