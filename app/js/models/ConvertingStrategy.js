import { default as web3Provider } from './web3.js'
import { default as contract } from 'truffle-contract'
import ConvertingStrategyABI from '../../../build/contracts/ConvertingStrategy.json'

export default Backbone.Model.extend({
	
	initialize: function() {
		this.web3 = new web3Provider();
		this.contract = contract(ConvertingStrategyABI);
		this.contract.setProvider(this.web3.provider);
	}

});