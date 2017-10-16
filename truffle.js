module.exports = {
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*", // Match any network id
      initialization: {
  	  	startAt: Math.floor(Date.now() / 1000) + 3600 * 2, 
  	  	finishAt: Math.floor(Date.now() / 1000) + 3600 * 7, 
  	  	goals: [
  		    13 * 1000 * 1000,
  		    30 * 1000 * 1000,
  		    50 * 1000 * 1000
  	  	],
  	  	initialDollarsInOneEther: 330,
        initialTokensInOneEther: 2,
        minInvestValueInEther:  0.000001
      }
    }
  }
};
