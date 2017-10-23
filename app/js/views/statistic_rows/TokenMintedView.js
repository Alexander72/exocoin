import AbstractRowView from "./AbstractRowView.js";

export default AbstractRowView.extend({

	el: '#token_minted',

	templateData: {
		title: 'Токенов выпущено',
	},

	render: function() {
		let tokenName,
			tokenInstance;

		this.crowdSale.contract.deployed().then((instance) => {
			return instance.token.call();
		}).then((tokenAddress)=> {
			return this.exocoin.contract.at(tokenAddress);
		}).then((instance) => {
			tokenInstance = instance;
			return instance.symbol.call();
		}).then((symbol) => {
			tokenName = symbol;
			return tokenInstance.totalSupply.call();
		}).then((totalSupply) => {
			this.parentRender(this.formatBigNumber(totalSupply) + ' ' + tokenName);
		});
	}
});