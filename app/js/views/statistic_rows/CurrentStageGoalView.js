import AbstractRowView from "./AbstractRowView.js";

export default AbstractRowView.extend({

	el: '#current_stage_goal',

	templateData: {
		title: 'Текущая цель',
	},

	render: function() {
		let contractInstance;

		this.crowdSale.contract.deployed().then((instance) => {
			contractInstance = instance;
			return instance.currentStageIndex.call();
		}).then((currentStageIndex)=> {
			return contractInstance.stageGoal.call(currentStageIndex);
		}).then((currentStageGoal)=> {
			this.parentRender(this.fromWeiToEther(currentStageGoal) + ' ETH');
		});
	}
});