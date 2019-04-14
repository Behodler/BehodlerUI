const WeiDai = artifacts.require('WeiDai')
const MockDai = artifacts.require('MockDai')
const WeiDaiBank = artifacts.require("WeiDaiBank")
const PRE = artifacts.require("PatienceRegulationEngine")
const VersionController = artifacts.require("WeiDaiVersionController")

module.exports = async function (deployer, network, accounts) {
	var weidaiInstance, weidaiBankInstance, preInstance, vcInstance
	var daiAddress, vcAddress

	var donationAddress = accounts[3]; //update later;

	await deployer.deploy(WeiDai)
	await deployer.deploy(WeiDaiBank)
	await deployer.deploy(PRE)

	weidaiInstance = await WeiDai.deployed()
	weidaiBankInstance = await WeiDaiBank.deployed()
	preInstance = await PRE.deployed();

	if (network === 'development') {
		await deployer.deploy(VersionController)
		await deployer.deploy(MockDai)
		vcInstance = await VersionController.deployed()
		vcAddress = vcInstance.address
		daiAddress = (await MockDai.deployed()).address
		await vcInstance.setContractGroup(1, weidaiInstance.address, daiAddress, preInstance.address, weidaiBankInstance.address, web3.utils.fromAscii("dweidai"))
		await vcInstance.setDefaultVersion(1)
	}
	else if (network === 'main') {
		const version = 1
		donationAddress = accounts[0];
		vcAddress = "to be determined"
		//TODO: instantiate vc using vcaddress and set contract group
		//TODO: await vcInstance.setContractGroup(1, weidaiInstance.address, daiAddress, preInstance.address, weidaiBankInstance.address, "WeiDai")
		daiAddress = '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359'
	}

	await weidaiBankInstance.setDonationAddress(donationAddress)
	await preInstance.setClaimWindowsPerAdjustment(10);

	await weidaiInstance.setVersionController(vcAddress)
	await weidaiBankInstance.setVersionController(vcAddress)
	await preInstance.setVersionController(vcAddress)
}