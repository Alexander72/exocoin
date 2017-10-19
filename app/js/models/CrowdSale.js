import { default as Web3 } from 'web3'
import { default as contract } from 'truffle-contract'
import CrowdSaleABI from '../../../build/contracts/CrowdSale.json'

export default Backbone.Model.extend({

	contract: {},

	TESTRPC_HOST: 'localhost',
	TESTRPC_PORT: '8545',
	
	initialize: function() {

		let provider = new Web3.providers.HttpProvider('http://'+this.TESTRPC_HOST+':'+this.TESTRPC_PORT);
		this.contract = contract(CrowdSaleABI);
		this.contract.setProvider(provider)	;
	}

});