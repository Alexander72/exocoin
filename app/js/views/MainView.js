import $ from 'jquery';
import Backbone from 'backbone';
import { default as web3Provider } from '../models/web3.js'

import CrowdSale from "../models/CrowdSale.js";
import ExoCount from "../models/ExoCount.js";
import ConvertingStrategy from "../models/ConvertingStrategy.js";

import AddressView from './statistic_rows/AddressView.js';

export default Backbone.View.extend({

	el : 'body',

	events : {
		'click .js-contest' : 'home'
	},

	views: [],

	initialize: function(options) {
		this.web3 = new web3Provider();

		this.crowdSale = new CrowdSale();
		this.exocoin = new ExoCount();
		this.convertingStrategy = new ConvertingStrategy();

		let temp = new AddressView();
		//this.views.push();
		//this.views.push(new TimerView());
		//this.views.push(new TotalInvestedView());
		//this.views.push(new CurrentStageGoalView());
		//this.views.push(new TokenMintedView());
		//this.views.push(new EtherDollarRatioView());

		this.render();
	},

	render: function() {
		this.renderAddress();
		this.renderTimer();
		this.renderTotalInvested();
		this.renderCurrentStageGoal();
		this.renderTokenMinted();
		this.renderEtherDollarRatio();

		return this;
	},

	renderAddress: function() {
		this.crowdSale.contract.deployed().then((instance) => {
			$('#contract_address', this.$el).html(instance.address);
		});
	},

	renderTimer: function() {
		let now = new Date();
		let contractInstance;
		let that = this;
		that.crowdSale.contract.deployed()
			.then((instance) => { 
				contractInstance = instance;
				return instance.startAt.call();
			}).then((startAt) => {
				let start = new Date(startAt.toNumber() * 1000);
				let time = this.dateFormat(start - now);
				if(now < start) {
					$("#time_remained").html('начало через ' + time.days + ' дней, ' + time.hours + ' часов, ' + time.minutes + ' минут, ' + time.sec + ' секунд');
					throw new Error('beforeStart');
				}
				return contractInstance.finishAt.call();
			}).then((finishAt) => {
				let finish = new Date(finishAt.toNumber() * 1000);
				let time = that.dateFormat(finish - now);
				if(now > finish) {
					$("#time_remained").html('crowdSale окончен');
					return true;
				}

				$("#time_remained").html(time.days + ' дней, ' + time.hours + ' часов, ' + time.minutes + ' минут, ' + time.sec + ' секунд');
			}).catch((err) => {
				if(!err.message == 'beforeStart') {
					throw err;
				}
			});

		//setTimeout(function() { that.renderTimer.apply(that); }, 1000);
	},

	renderCurrentStageGoal: function() {
		let contractInstance;

		this.crowdSale.contract.deployed().then((instance) => {
			contractInstance = instance;
			return instance.currentStageIndex.call();
		}).then((currentStageIndex)=> {
			return contractInstance.stageGoal.call(currentStageIndex);
		}).then((currentStageGoal)=> {
			$('#current_stage_goal', this.$el).html(this.fromWeiToEther(currentStageGoal));
		});
	},

	renderTotalInvested: function() {
		this.crowdSale.contract.deployed().then((instance) => {
			return instance.totalInvested.call();
		}).then((totalInvested)=> {
			$('#ether_got', this.$el).html(this.fromWeiToEther(totalInvested));
		});
	},

	renderTokenMinted: function() {
		this.crowdSale.contract.deployed().then((instance) => {
			return instance.token.call();
		}).then((tokenAddress)=> {
			return this.exocoin.contract.at(tokenAddress);
		}).then((tokenInstance) => {
			return tokenInstance.totalSupply.call();
		}).then((totalSupply) => {
			$('#token_minted').html(this.formatBigNumber(totalSupply));
		});
	},

	renderEtherDollarRatio: function() {
		this.crowdSale.contract.deployed().then((instance) => {
			return instance.convertingStrategy.call();
		}).then((strategyAddress)=> {
			return this.convertingStrategy.contract.at(strategyAddress);
		}).then((strategyInstance) => {
			return strategyInstance.weiInOneDollar.call();
		}).then((weiInOneDollar) => {
			let ratio = Math.round(this.web3.utils.toWei(1, 'ether') / weiInOneDollar.toNumber(), 2);
			$('#ether_dollar_ratio').html(ratio);
		});
	},

	dateFormat: function(diff) {
		let res = {};

		res.days = Math.floor(diff / 1000 / 3600 / 24);
		res.hours = Math.floor((diff - (res.days * 24 * 3600 * 1000)) / 3600 / 1000);
		res.minutes = Math.floor((diff - (res.days * 24 * 3600 * 1000) - (res.hours *  3600 * 1000)) / 60 / 1000);
		res.sec = Math.floor((diff - (res.days * 24 * 3600 * 1000) - (res.hours *  3600 * 1000) - (res.minutes *  60 * 1000)) / 1000);

		return res;
	},

	fromWeiToEther: function(value) {
		if(typeof value == 'object')
			return this.formatBigNumber(this.web3.utils.fromWei(value, 'ether'));
		else
			return this.web3.utils.fromWei(value, 'ether');
	},

	formatBigNumber: function(bigNumber) {
		return bigNumber.round(2).toString();
	}

});