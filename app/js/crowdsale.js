crowdSale = {
	contract:{},

	init: function(JsonABI, provider){

	  	crowdSale.contract = contract(JsonABI)
	  	crowdSale.contract.setProvider(provider)
	}

}