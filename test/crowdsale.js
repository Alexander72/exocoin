var CrowdSale = artifacts.require("./CrowdSale.sol");

contract('CrowdSale', function(accounts) {

	var crowdSale;
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

	//printBalances(accounts);

	it('try to invest before investing stage', function(done){
		CrowdSale.deployed().then(function(instance) {
			return instance.sendTransaction({
				from: accounts[4],
				value: web3.toWei(1, 'ether'),
				to: instance.address
			});
		}).catch((err) => {
			const isContractThrow = err.message.indexOf('VM Exception while processing transaction: invalid opcode') != -1;
			assert(isContractThrow, "Expected throw, got '" + err + "' instead");
			done();
		});
	});

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

	it("deposit 1 ether", function(done){
		CrowdSale.deployed().then(function(instance) {
			crowdSale = instance;

			return crowdSale.totalInvested.call();
		}).then(function(totalInvested){
			totalInvestedOld = totalInvested;

			return crowdSale.sendTransaction({
				from: accounts[4],
				value: web3.toWei(1, 'ether'),
				to: crowdSale.address
			});
		}).then(function(tx) {
		    assert.isOk(tx.receipt);

			return crowdSale.totalInvested.call();
		}).then(function(totalInvested){

			assert.equal(totalInvested, (Number(totalInvestedOld) + Number(web3.toWei(1, 'ether'))), 'total balance should be '+ (Number(totalInvestedOld) + Number(web3.toWei(1, 'ether'))));

			return crowdSale.withdrawAmount.call(0, accounts[4]);
		}).then(function(canWithdraw) {
			assert.equal(canWithdraw, web3.toWei(1, 'ether'), 'We are at first stage, 4th acc should can withdraw 1 ether');

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
				from: accounts[5],
				value: web3.toWei(7, 'ether'),
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

	/*function printBalances(accounts) {
		var value;
	    accounts.forEach(function(ac, i) {
	    	web3.eth.getBalance(ac).then(function(value){
	    		console.log(ac + '('+i+')', value);
	    	})
	    })
	}*/
});
