var CrowdSale = artifacts.require("CrowdSale");

module.exports = function(deployer, network) {
  console.log(network);
  deployer.deploy(CrowdSale,
  	Date.now(), 
  	3600 * 5, 
  	"0x685adf7de7a0ee341b8da2bdbdf26b02795f9d91",
  	[13, 30, 50],
  	1000*1000*1000*1000*1000*1000,
  );
};
