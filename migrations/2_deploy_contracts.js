const networks = require('../truffle.js');
var CrowdSale = artifacts.require("CrowdSale");


module.exports = function(deployer, network, accounts) {
  const config = networks.networks[network].initialization;
  const beneficiary = network == 'live' && config.beneficiary ? config.beneficiary : accounts[1];


  deployer.deploy(CrowdSale,
    config.startAt,
    config.finishAt,
    beneficiary,
    config.goals,
    Math.floor(web3.toWei(1, 'ether') / config.initialDollarsInOneEther),
    Math.floor(web3.toWei(1, 'ether') / config.initialTokensInOneEther),
    web3.toWei(config.minInvestValueInEther, 'ether')
  );
};
