import AbstractRowView from "./AbstractRowView.js";

export default AbstractRowView.extend({

	el: "#time_remained",

	timerTemplate: require('../../../templates/timer.twig'),

	templateData: {
		title: 'Текущий этап',
	},

	render: function() {
		let now = new Date();
		let contractInstance;
		let that = this;
		that.crowdSale.contract.deployed()
			.then((instance) => { 
				contractInstance = instance;
				return instance.startAt.call();
			}).then((startAt) => {

				let start = new Date(startAt.toNumber() * 1000);
				let time = that.dateFormat(start - now);

				if(now < start) {
					that.parentRender('Начало Crowd Sale через ' + that.timerTemplate(time));
					throw new Error('beforeStart');
				}
				return contractInstance.finishAt.call();
			}).then((finishAt) => {

				let finish = new Date(finishAt.toNumber() * 1000);
				let time = that.dateFormat(finish - now);

				if(now > finish) {
					that.parentRender('Сrowd Sale окончен');
					throw new Error('afterFinish');
				}
				that.parentRender('Окончание Crowd Sale через ' + that.timerTemplate(time));
			}).catch((err) => {
				if(err.message != 'beforeStart' && err.message != 'afterFinish') {
					throw err;
				}
			});

		//setTimeout(function() { that.render.apply(that); }, 1000);
	},	

	dateFormat: function(diff) {
		let res = {};

		res.days = Math.floor(diff / 1000 / 3600 / 24);
		res.hours = Math.floor((diff - (res.days * 24 * 3600 * 1000)) / 3600 / 1000);
		res.minutes = Math.floor((diff - (res.days * 24 * 3600 * 1000) - (res.hours *  3600 * 1000)) / 60 / 1000);
		res.seconds = Math.floor((diff - (res.days * 24 * 3600 * 1000) - (res.hours *  3600 * 1000) - (res.minutes *  60 * 1000)) / 1000);

		return res;
	},
});