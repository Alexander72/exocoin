import _ from 'underscore';

import { default as web3Provider } from '../../models/web3.js'

import CrowdSale from "../../models/CrowdSale.js";
import ExoCount from "../../models/ExoCount.js";
import ConvertingStrategy from "../../models/ConvertingStrategy.js";

export default Backbone.View.extend({

	template: require('../../../templates/statistic-row.twig'),

	templateData: {},

	initialize: function(options) {
		this.options = options;

		this.web3 = new web3Provider();

		this.crowdSale = new CrowdSale();
		this.exocoin = new ExoCount();
		this.convertingStrategy = new ConvertingStrategy();

		this.render();
	},

	render: function() {},

	getRenderedTemplate: function(val) {
		this.templateData = _.extend(this.templateData, {value: val});
		return this.template(this.templateData);
	},

	parentRender: function(val) {		
		this.$el.html(this.getRenderedTemplate(val));

		return this;
	},

	fromWeiToEther: function(value) {
		if(typeof value == 'object')
			return this.formatBigNumber(this.web3.utils.fromWei(value, 'ether'));
		else
			return this.web3.utils.fromWei(value, 'ether');
	},

	formatBigNumber: function(bigNumber) {
		return bigNumber.round(2).toString();
	}
});