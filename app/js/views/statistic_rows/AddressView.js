import AbstractRowView from "./AbstractRowView.js";

export default AbstractRowView.extend({

	el: '#contract_address',

	templateData: {
		title: 'Адрес контракта',
	},

	render: function() {
		this.crowdSale.contract.deployed().then((instance) => {
			this.parentRender(instance.address);
		});
	}
});