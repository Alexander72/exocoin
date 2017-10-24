const CrowdSale = artifacts.require("CrowdSale");
const ExoCoin = artifacts.require("ExoCoin");

contract('CrowdSale', function(accounts) {

	var crowdSale;
	var exoCoin;
	var totalInvestedOld;

	const increaseTime = function (time) {
	  return web3.currentProvider.send({
	      jsonrpc: "2.0",
	      method: "evm_increaseTime",
	      params: [time],
	      id: new Date().getTime()
	    });
	};

	const mine = function() {
	  return web3.currentProvider.send({
	      jsonrpc: "2.0",
	      method: "evm_mine",
	      params: [], 
	      id: new Date().getTime()
	    });
	};

	const getLatestBlock = function() {
		return web3.eth.getBlock('latest');
	};

	it("dummy test", function (done) {
		CrowdSale.deployed().then(function(instance) {
			crowdSale = instance;
			done();
		});
	});

	//printBalances(accounts);
/*
	it("test evm_increaseTime", function (done) {
		CrowdSale.deployed().then(function(instance) {
			crowdSale = instance;
			return getLatestBlock();
		}).then((block) => {
		    return increaseTime(3600 * 3)
		}).then((res) => {
			return mine();
		}).then((res) => {
			return getLatestBlock();
		}).then((block) => {
			assert.isAbove(block.timestamp, Math.floor(Date.now() / 1000), 'time should be increased');
			done();
		});
	});

	it("invest less than allowed", function(done){
		CrowdSale.deployed().then(function(instance) {
			crowdSale = instance;

			return crowdSale.totalInvested.call();
		}).then(function(totalInvested){
			totalInvestedOld = totalInvested;

			return crowdSale.sendTransaction({
				from: accounts[4],
				value: web3.toWei(0.000000001, 'ether'),
				to: crowdSale.address
			});
		}).then((res) => {
			throw new Error('it should be impossible to invest less than allowed');
		}).catch((err) => {
			const isContractThrow = err.message.indexOf('VM Exception while processing transaction: invalid opcode') != -1;
			assert(isContractThrow, "Expected throw, got '" + err + "' instead");
			done();
		});
	});

	it('get second stage', function(done){
		CrowdSale.deployed().then(function(instance) {
			crowdSale = instance;

			return crowdSale.stageInvested.call(0);
		}).then(function(stageInvested) {
			assert.equal(stageInvested, web3.toWei(1, 'ether'), 'in first stage should be invested 1 ether');

			return crowdSale.sendTransaction({
				from: accounts[4],
				value: web3.toWei(10, 'ether'),
				to: crowdSale.address
			});
		}).then(function(tx){			
		    assert.isOk(tx.receipt);

			return crowdSale.totalInvested.call();
		}).then(function(totalInvested){
			assert.equal(totalInvested, web3.toWei(8, 'ether'), 'second invest failed');

			return crowdSale.sendTransaction({
				from: accounts[6],
				value: web3.toWei(6, 'ether'),
				to: crowdSale.address
			});
		}).then(function(tx){
		    assert.isOk(tx.receipt);

			return crowdSale.totalInvested.call();
		}).then(function(totalInvested){
			assert.equal(totalInvested, web3.toWei(14, 'ether'), 'third invest failed');

			return crowdSale.currentStageIndex.call();
		}).then((stage) => {
			assert.equal(stage, 1, 'we should achive second stage(1)');

			return crowdSale.stageGoal.call(0);
		}).then((firstGoal) => {
			assert.equal(firstGoal, web3.toWei(13, 'ether'), 'first goal check');

			return web3.eth.getBalance(accounts[2]);
		}).then((balance) => {
			assert.equal(balance, web3.toWei(113, 'ether'), 'benefeciary should have 113 ether(100 + 13)');
			done();
		});
	});

	it('Check exocoin balance', function(done) {
		CrowdSale.deployed().then((instance) => {
			crowdSale = instance;
			return crowdSale.token.call();
		}).then((tokenAddress) => {
			return ExoCoin.at(tokenAddress);
		}).then((tokenInstance) => {
			return tokenInstance.balanceOf(accounts[4]);
		}).then((balance) => {
			assert.equal(balance, web3.toWei(2, 'ether'), 'token should be minted');
			done();
		});
	});*/

	/*function printBalances(accounts) {
		var value;
	    accounts.forEach(function(ac, i) {
	    	web3.eth.getBalance(ac).then(function(value){
	    		console.log(ac + '('+i+')', value);
	    	})
	    })
	}*/
});
