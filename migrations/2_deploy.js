const WeiDai = artifacts.require('WeiDai')
const MockDai = artifacts.require('MockDai')
const WeiDaiBank = artifacts.require("WeiDaiBank")

module.exports = async function (deployer, network, accounts) {
	var weidaiInstance,weidaiBankInstance
	var daiAddress

	await deployer.deploy(WeiDai)
	await deployer.deploy(WeiDaiBank)

	weidaiInstance = await WeiDai.deployed()
	weidaiBankInstance = await WeiDaiBank.deployed();

	if (network === 'development') {
		await deployer.deploy(MockDai)
		daiAddress = (await MockDai.deployed()).address
	}
	else if (network === 'main') {
		daiAddress = '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359'
	}
	
	await weidaiBankInstance.setDependencies(weidaiInstance.address,daiAddress)
	await weidaiInstance.setBank(weidaiBankInstance.address, true)

	
}