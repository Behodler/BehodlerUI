const WeiDai = artifacts.require('WeiDai')
const MockDai = artifacts.require('MockDai')
const WeiDaiBank = artifacts.require("WeiDaiBank")
const PRE = artifacts.require("PatienceRegulationEngine")
const VersionController = artifacts.require("WeiDaiVersionController")
const fs = require('fs')

module.exports = async function (deployer, network, accounts) {
	var weidaiInstance, weidaiBankInstance, preInstance, vcInstance
	var daiAddress

	var donationAddress = "0x991c13Fd597fAfcBDD90Fa26E99B9B77baCdDC44"; //update later;

	await deployer.deploy(WeiDai)
	await deployer.deploy(WeiDaiBank)
	await deployer.deploy(PRE)

	weidaiInstance = await WeiDai.deployed()
	weidaiBankInstance = await WeiDaiBank.deployed()
	preInstance = await PRE.deployed();

	if (network === 'development' || network == 'gethdev') {
		await deployer.deploy(VersionController)
		await deployer.deploy(MockDai)
		vcInstance = await VersionController.deployed()
		vcAddress = vcInstance.address

		daiAddress = (await MockDai.deployed()).address
		await vcInstance.setContractGroup(1, weidaiInstance.address, daiAddress, preInstance.address, weidaiBankInstance.address, web3.utils.fromAscii("dweidai"), true)
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
	else if (network == 'kovan-fork' || network=='kovan') {
		await deployer.deploy(VersionController)
		vcInstance = await VersionController.deployed()
		vcAddress = vcInstance.address
		daiAddress = '0xC4375B7De8af5a38a93548eb8453a498222C4fF2'
		await vcInstance.setContractGroup(1, weidaiInstance.address, daiAddress, preInstance.address, weidaiBankInstance.address, web3.utils.fromAscii("kweidai"), true)
		await vcInstance.setDefaultVersion(1)
	}
	writeNetworkObject(network == 'development' ? 'private' : network, vcAddress)

	await weidaiBankInstance.setDonationAddress(donationAddress)
	await preInstance.setClaimWindowsPerAdjustment(10);

	await weidaiInstance.setVersionController(vcAddress)
	await weidaiBankInstance.setVersionController(vcAddress)
	await preInstance.setVersionController(vcAddress)
}


let writeNetworkObject = (network, address) => {
	const fileLocation = '../client/src/networkVersionControllers.json'
	const fs = require('fs')
	const exists = fs.existsSync(fileLocation)
	const stringify = (data) => JSON.stringify(data, null, 4)
	const parse = (text) => JSON.parse(text)

	let networkObject = {
		networks: [{
			name: 'private',
			address: ''
		}]
	}
	if (!exists) {
		fs.writeFileSync(fileLocation, stringify(networkObject))
	}

	networkObject = parse(fs.readFileSync(fileLocation))
	let found = false;
	for (let i = 0; i < networkObject.networks.length; i++) {
		if (networkObject.networks[i].name == network) {
			found = true;
			networkObject.networks[i].address = address
			break;
		}
	}
	if (!found)
		networkObject.networks.push({ name: network, address })

	fs.writeFileSync(fileLocation, stringify(networkObject))
}