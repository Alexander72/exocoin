const Web3 = require('web3')
let web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))
var CrowdSale = artifacts.require("./CrowdSale.sol");

//console.log(web3.utils.fromWei(300000000000000000, 'ether'));

contract('CrowdSale', function(accounts) {

	printBalances(accounts);

	var crowdSale;
	var totalInvestedOld;

	it("deposit 1 ether", function(done){
		CrowdSale.deployed().then(function(instance) {
			crowdSale = instance;

			return crowdSale.canInvest.call();
		}).then(function(canInvest){
			console.log('canInvest: ' + canInvest);

			assert.equal(canInvest, true, 'investing stage should be now');

			return crowdSale.totalInvested.call();
		}).then(function(totalInvested){
			totalInvestedOld = totalInvested;
			console.log('totalInvested: ' + totalInvested);
			console.log('try to send ' + web3.utils.toWei(0.3, 'ether') + ' wei');

			return crowdSale.sendTransaction({
				from: accounts[4],
				value: web3.utils.toWei(0.3, 'ether'),
				to: crowdSale.address
			});
		}).then(function(tx) {
			console.log(tx.reciept);
		    assert.isOk(tx.receipt);

			return crowdSale.totalInvested.call();
		}).then(function(totalInvested){
			console.log('new totalInvested : ' + totalInvested);

			assert.equal(totalInvested, totalInvestedOld + web3.utils.toWei(0.3, 'ether'), 'total balance should be '+ web3.utils.toWei(0.3, 'ether'));

		});

	});

	function printBalances(accounts) {
		var value;
	    accounts.forEach(function(ac, i) {
	    	web3.eth.getBalance(ac).then(function(value){
	    		console.log(ac, value);
	    	})
	    })
	}
});
