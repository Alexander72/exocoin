import $ from 'jquery';
import Backbone from 'backbone';
import { default as web3Provider } from '../models/web3.js'

import CrowdSale from "../models/CrowdSale.js";
import ExoCount from "../models/ExoCount.js";
import ConvertingStrategy from "../models/ConvertingStrategy.js";

import AddressView          from './statistic_rows/AddressView.js';
import InvestingTimerView   from './statistic_rows/InvestingTimerView.js';
import TotalInvestedView    from './statistic_rows/TotalInvestedView.js';
import CurrentStageGoalView from './statistic_rows/CurrentStageGoalView.js';
import TokenMintedView      from './statistic_rows/TokenMintedView.js';
import EtherDollarRatioView from './statistic_rows/EtherDollarRatioView.js';

export default Backbone.View.extend({

	el : 'body',

	events : {
		'click .js-contest' : 'home'
	},

	views: [],

	initialize: function(options) {
		this.web3 = new web3Provider();

		this.crowdSale = new CrowdSale();
		this.exocoin = new ExoCount();
		this.convertingStrategy = new ConvertingStrategy();

		this.views.push(new AddressView({parent: this}));
		this.views.push(new InvestingTimerView({parent: this}));
		this.views.push(new TotalInvestedView({parent: this}));
		this.views.push(new CurrentStageGoalView({parent: this}));
		this.views.push(new TokenMintedView({parent: this}));
		this.views.push(new EtherDollarRatioView({parent: this}));
	},

	render: function() {
		for (let key in this.views ) {
			this.views[key].render();
		}
	},

});