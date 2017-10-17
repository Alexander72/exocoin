import '../bootstrap_3.3.7/css/bootstrap.min.css';

import $ from "./jquery1.12.4.min.js"
import { default as Web3 } from 'web3'
import { default as contract } from 'truffle-contract'
import CrowdSale from '../../build/contracts/CrowdSale.json'

const TESTRPC_HOST = 'localhost'
const TESTRPC_PORT = '8545'

function component () {
  var $element = $('<div>')
  let provider = new Web3.providers.HttpProvider(`http://${TESTRPC_HOST}:${TESTRPC_PORT}`)
  let crowdSale = contract(CrowdSale)
  crowdSale.setProvider(provider)
  crowdSale.deployed()
    .then((instance) => { 
    	$element.html(`Metacoin address: ${instance.address}`)
    })

  return $element
}

$(function(){
	$('body').html(component());
});