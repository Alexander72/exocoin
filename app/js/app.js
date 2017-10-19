import '../bootstrap_3.3.7/css/bootstrap.min.css';

import $ from "./jquery1.12.4.min.js"
import { default as Web3 } from 'web3'
import { default as contract } from 'truffle-contract'

import CrowdSale from '../../build/contracts/CrowdSale.json'

const TESTRPC_HOST = 'localhost'
const TESTRPC_PORT = '8545'

let crowdSale;
let crowdSaleContract;
let web3;

function update_time_remained() {

  crowdSaleContract.deployed()
	.then((instance) => { 
	  return instance.finishAt.call();
	}).then((finishAt) => {
	  let now = new Date();
	  let finish = new Date(finishAt * 1000);
	  let diff = (finish - now);

	  let days = Math.floor(diff / 1000 / 3600 / 24);
	  let hours = Math.floor((diff - (days * 24 * 3600 * 1000)) / 3600 / 1000);
	  let minutes = Math.floor((diff - (days * 24 * 3600 * 1000) - (hours *  3600 * 1000)) / 60 / 1000);
	  let sec = Math.floor((diff - (days * 24 * 3600 * 1000) - (hours *  3600 * 1000) - (minutes *  60 * 1000)) / 1000);
	  $("#time_remained").html(days + ' дней, ' + hours + ' часов, ' + minutes + ' минут, ' + sec + ' секунд');
	});

  setTimeout(update_time_remained, 330);
}

function init () {
  if (typeof web3 !== 'undefined') {
	web3 = new Web3(web3.currentProvider);
  } else {
	// set the provider you want from Web3.providers
	web3 = new Web3(new Web3.providers.HttpProvider(`http://${TESTRPC_HOST}:${TESTRPC_PORT}`));
  }

  let provider = new Web3.providers.HttpProvider(`http://${TESTRPC_HOST}:${TESTRPC_PORT}`)
  crowdSaleContract = contract(CrowdSale)
  crowdSaleContract.setProvider(provider)
  crowdSaleContract.deployed()
	.then((instance) => { 
	  crowdSaleInstance.instance = instance;
	  crowdSaleInstance.init();
		$("#contract_address").html(instance.address)
	  update_time_remained();
	  return crowdSaleInstance.currentStageIndex.call();
	}).then((currentStageIndex) => {
	  return crowdSaleInstance.stageGoal.call(currentStageIndex);
	}).then((goal) => {
	  let currGoal = web3._extend.utils.fromWei(goal, "ether").round(2).toString()
	  $("#current_stage_goal").html(currGoal);
	  return crowdSaleInstance.totalInvested.call();
	}).then((totalInvested) => {
	  let totalInvestedFormatted = web3._extend.utils.fromWei(totalInvested, "ether").round(2).toString()
	  $("#ether_got").html(totalInvestedFormatted);
	});
}

$(function(){	
  	if (typeof web3 !== 'undefined') {
		web3 = new Web3(web3.currentProvider);
  	} else {
		web3 = new Web3(new Web3.providers.HttpProvider(`http://${TESTRPC_HOST}:${TESTRPC_PORT}`));
  	}

  	let provider = new Web3.providers.HttpProvider(`http://${TESTRPC_HOST}:${TESTRPC_PORT}`)

	crowdSale.init(CrowdSale, provider);
});