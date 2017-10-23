import AbstractRowView from "./AbstractRowView.js";

export default AbstractRowView.extend({

	el: '#ether_got',

	templateData: {
		title: 'Эфиров собрано',
	},

	render: function() {
		this.crowdSale.contract.deployed().then((instance) => {
			return instance.totalInvested.call();
		}).then((totalInvested)=> {
			this.parentRender(this.fromWeiToEther(totalInvested) + ' ETH');
		});
	}
});