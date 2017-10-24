const CrowdSale = artifacts.require("CrowdSale");

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

	it('try to invest before investing stage', function(done){
		CrowdSale.deployed().then(function(instance) {
			return instance.sendTransaction({
				from: accounts[3],
				value: web3.toWei(1, 'ether'),
				to: instance.address
			});
		}).then((res) => {
			throw new Error('it should be impossible to invest before start time');
		}).catch((err) => {
			const isContractThrow = err.message.indexOf('VM Exception while processing transaction: invalid opcode') != -1;
			assert(isContractThrow, "Expected throw, got '" + err + "' instead");
			done();
		});
	});
});
