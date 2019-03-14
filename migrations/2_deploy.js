const WeiDai = artifacts.require('WeiDai')
const MockDai = artifacts.require('MockDai')
const WeiDaiBank = artifacts.require("WeiDaiBank")
const PRE = artifacts.require("PatienceRegulationEngine");

module.exports = async function (deployer, network, accounts) {
	var weidaiInstance, weidaiBankInstance, preInstance
	var daiAddress

	var donationAddress = accounts[3]; //update later;

	await deployer.deploy(WeiDai)
	await deployer.deploy(WeiDaiBank)
	await deployer.deploy(PRE)

	weidaiInstance = await WeiDai.deployed()
	weidaiBankInstance = await WeiDaiBank.deployed()
	preInstance = await PRE.deployed();

	if (network === 'development') {
		await deployer.deploy(MockDai)
		daiAddress = (await MockDai.deployed()).address
	}
	else if (network === 'main') {
		daiAddress = '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359'
	}

	await weidaiBankInstance.setDependencies(weidaiInstance.address, daiAddress, donationAddress, preInstance.address)
	await weidaiInstance.setBank(weidaiBankInstance.address, true)
	await preInstance.setDependencies(weidaiBankInstance.address, weidaiInstance.address);
}