const Web3 = require('web3')
let web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))
var CrowdSale = artifacts.require("CrowdSale");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(CrowdSale,
  	Math.floor(Date.now() / 1000), 
  	3600 * 5, 
  	accounts[2],
  	[
  		13,
  		30,
  		50,
  	],
  	web3.utils.toWei(1, 'ether'),
  );
};
