import { default as Web3 } from 'web3'

export default  Backbone.Model.extend({

	TESTRPC_HOST: 'localhost',
	TESTRPC_PORT: '8545',

	initialize: function() {
		if (typeof web3 !== 'undefined') {
			this.provider = web3.currentProvider;
		} else {
			// set the provider you want from Web3.providers
		 	this.provider = new Web3.providers.HttpProvider('http://'+this.TESTRPC_HOST+':'+this.TESTRPC_PORT);
		}
		
		this.utils = new Web3(this.provider);
	}
});