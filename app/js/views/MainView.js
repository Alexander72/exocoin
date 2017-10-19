import $ from 'jquery';
import Backbone from 'backbone';
import CrowdSale from "../models/CrowdSale.js";

export default Backbone.View.extend({

	el : 'body',

	events : {
		'click .js-contest' : 'home'
	},

	crowdSale: {},

	initialize: function(options) {
		this.crowdSale = new CrowdSale();
		this.render();
	},

	render: function() {
		this.renderAddress();
		this.renderTimer();

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
				let start = new Date(startAt * 1000);
				let time = this.dateFormat(start - now);
				if(now < start) {
					$("#time_remained").html('начало через' + time.days + ' дней, ' + time.hours + ' часов, ' + time.minutes + ' минут, ' + time.sec + ' секунд');
					return true;
				}
				return contractInstance.finishAt.call();
			}).then((finishAt) => {
				let finish = new Date(finishAt * 1000);
				let time = that.dateFormat(finish - now);

				$("#time_remained").html(time.days + ' дней, ' + time.hours + ' часов, ' + time.minutes + ' минут, ' + time.sec + ' секунд');
			});

		setTimeout(function() { that.renderTimer.apply(that); }, 330);
	},

	dateFormat: function(diff) {
		let res = {};

		res.days = Math.floor(diff / 1000 / 3600 / 24);
		res.hours = Math.floor((diff - (res.days * 24 * 3600 * 1000)) / 3600 / 1000);
		res.minutes = Math.floor((diff - (res.days * 24 * 3600 * 1000) - (res.hours *  3600 * 1000)) / 60 / 1000);
		res.sec = Math.floor((diff - (res.days * 24 * 3600 * 1000) - (res.hours *  3600 * 1000) - (res.minutes *  60 * 1000)) / 1000);

		return res;
	}

});