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

	it('get second stage and stop (account[4] 10 ETH & account[5] 43330 ETH)', function(done){
		CrowdSale.deployed().then(function(instance) {
			crowdSale = instance;

			return crowdSale.sendTransaction({
				from: accounts[4],
				value: web3.toWei(10, 'ether'),
				to: crowdSale.address
			});
		}).then(function(tx){			
		    assert.isOk(tx.receipt);

			return crowdSale.sendTransaction({
				from: accounts[5],
				value: web3.toWei(43330, 'ether'),
				to: crowdSale.address
			});
		}).then(function(tx){
		    assert.isOk(tx.receipt);

		    return increaseTime(3600 * 10);
		}).then((res) => {
			return mine();
		}).then((res) => {
			return crowdSale.currentStageIndex.call();
		}).then(function(currentStageIndex){
			assert.equal(currentStageIndex, 1, 'second stage should be achived');

			done();
		});
	});/*

	it('Check account 1 balance', function(done) {
		let balance = web3.eth.getBalance(accounts[2]);
		expect(balance).to.be.closeTo(web3.toWei(4333.333333333333, 'ether').toNumber(), 100000000, 'beneficiary should get first stage ether value');

		done();
	});*/

	it('Check exocoin account 4 balance', function(done) {
		CrowdSale.deployed().then((instance) => {
			crowdSale = instance;
			return crowdSale.token.call();
		}).then((tokenAddress) => {
			return ExoCoin.at(tokenAddress);
		}).then((tokenInstance) => {
			return tokenInstance.balanceOf.call(accounts[4]);
		}).then((balance) => {
			console.log(balance.toString());
			console.log(web3.toWei(20, 'ether'));
			assert.equal(balance, web3.toWei(20, 'ether'), 'token should be minted');
			done();
		});
	});

	it('Check exocoin account 5 balance', function(done) {
		CrowdSale.deployed().then((instance) => {
			crowdSale = instance;
			return crowdSale.token.call();
		}).then((tokenAddress) => {
			return ExoCoin.at(tokenAddress);
		}).then((tokenInstance) => {
			return tokenInstance.balanceOf.call(accounts[5]);
		}).then((balance) => {
			console.log(balance.toNumber());
			assert.equal(balance, web3.toWei(86660, 'ether'), 'token should be minted');
			done();
		});
	});

	it('try to withdraw from account 4', function(done){
		CrowdSale.deployed().then(function(instance) {
			crowdSale = instance;
			return crowdSale.withdraw({from: accounts[4]});
		}).then((res) => {
			throw new Error('it should be impossible to withdraw from account 4');
		}).catch((err) => {
			const isContractThrow = err.message.indexOf('VM Exception while processing transaction: invalid opcode') != -1;
			assert(isContractThrow, "Expected throw, got '" + err + "' instead");
			done();
		});
	});

	it('try to withdraw from account 5', function(done){
		CrowdSale.deployed().then(function(instance) {
			crowdSale = instance;
			return crowdSale.withdraw({from: accounts[5]});
		}).then((tx) => {
		    assert.isOk(tx.receipt, 'withdraw should be successful');
		    done();
		});
	});
});