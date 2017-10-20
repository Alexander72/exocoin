import _ from 'underscore';

import { default as web3Provider } from '../../models/web3.js'

import CrowdSale from "../../models/CrowdSale.js";
import ExoCount from "../../models/ExoCount.js";
import ConvertingStrategy from "../../models/ConvertingStrategy.js";

export default Backbone.View.extend({

	el: '.table.statistic tbody',

	template: null,

	templateData: {},

	initialize: function(options) {
		this.web3 = new web3Provider();

		this.crowdSale = new CrowdSale();
		this.exocoin = new ExoCount();
		this.convertingStrategy = new ConvertingStrategy();

		this.render();
	},

	render: function() {},

	getAddValueToData: function(data) {
		return _.extend(this.templateData, {value: data});
	}
});