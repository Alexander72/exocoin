import '../bootstrap_3.3.7/css/bootstrap.min.css';
import $ from 'jquery';
import _ from 'underscore';
import MainView from './views/MainView.js';

$(function () {
	window.View = new MainView;
});