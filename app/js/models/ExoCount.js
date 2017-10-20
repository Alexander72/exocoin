import { default as web3Provider } from './web3.js'
import { default as contract } from 'truffle-contract'
import ExoCoinABI from '../../../build/contracts/ExoCoin.json'

export default Backbone.Model.extend({
	
	initialize: function() {
		this.web3 = new web3Provider();
		this.contract = contract(ExoCoinABI);
		this.contract.setProvider(this.web3.provider);
	}

});