import $ from 'jquery';
import AbstractRowView from "./AbstractRowView.js";

export default AbstractRowView.extend({

	el: '#ether_dollar_ratio',

	events: {
		'click button': 'changeRatio'
	},

	templateData: {
		title: 'Курс эфира, установленный в контракте',
	},

	render: function() {
		this.crowdSale.contract.deployed().then((instance) => {
			return instance.convertingStrategy.call();
		}).then((strategyAddress)=> {
			return this.convertingStrategy.contract.at(strategyAddress);
		}).then((strategyInstance) => {
			return strategyInstance.weiInOneDollar.call();
		}).then((weiInOneDollar) => {
			let ratio = (this.web3.utils.toWei(1, 'ether') / weiInOneDollar.toNumber()).toFixed(2);
			this.parentRender('1 ETH = ' + ratio + ' USD <input class="input" name="ratio"/> <button type="button" class="btn btn-success">Изменить курс</button>');
		});
	},

	changeRatio: function(e) {
		let ratio = $('input[name=ratio]', this.$el).val();

		if (ratio) {			
			ratio = Math.floor(this.web3.utils.toWei(1, 'ether') / ratio);

			this.crowdSale.contract.deployed().then((instance) => {
				return instance.setWeiInOneDollar(ratio, {from: this.web3.utils.eth.coinbase});
			}).then((result) => {
				alert('Успешно изменено!');
				this.options.parent.render();
			}).catch((err) => {
				console.log(err);
			});
		}
	}
});