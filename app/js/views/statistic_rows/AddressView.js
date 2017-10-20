import AbstractRowView from "./AbstractRowView.js";

export default AbstractRowView.extend({

	template: require('../../../templates/statistic-row.twig'),

	templateData: {
		title: 'Адрес контракта',
	},

	render: function() {
		this.crowdSale.contract.deployed().then((instance) => {
			this.$el.append(this.template(this.getAddValueToData(instance.address)));
		});
	}
});