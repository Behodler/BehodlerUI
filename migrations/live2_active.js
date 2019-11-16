
const WeiDai = artifacts.require('WeiDai')
const WeiDaiBank = artifacts.require('WeiDaiBank')
const PotReserve = artifacts.require('PotReserve')
const PatienceRegulationEngine = artifacts.require('PatienceRegulationEngine')

module.exports = async function (deployer, network, accounts) {
	await deployer.deploy(WeiDai)
	await deployer.deploy(WeiDaiBank)
	await deployer.deploy(PatienceRegulationEngine)
	await deployer.deploy(PotReserve)

	const weiDaiInstance = await WeiDai.deployed()
	const weiDaiBankInstance = await WeiDaiBank.deployed()
	const preInstance = await PatienceRegulationEngine.deployed()
	const potReserveInstance = await PotReserve.deployed()
	const makerAddresses = { pot: '', dai: '', daijoin: '' }

	if (network == 'kovan-fork' || network == 'kovan') {
		makerAddresses.pot = '0xea190dbdc7adf265260ec4da6e9675fd4f5a78bb'
		makerAddresses.dai = '0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa'
		makerAddresses.daijoin = '0x5aa71a3ae1c0bd6ac27a1f28e1415fffb6f15b8c'
	}

	await weiDaiBankInstance.setReserveAddress(potReserveInstance.address)
	let vcAddress = loadVCAddress(network)
	await weiDaiBankInstance.setVersionController(vcAddress)
	await weiDaiInstance.setVersionController(vcAddress)
	await preInstance.setVersionController(vcAddress)
	
	await potReserveInstance.setMakerAddresses(makerAddresses.pot, makerAddresses.dai, makerAddresses.daijoin)
	await potReserveInstance.approveForTesting()
	await potReserveInstance.setBank(weiDaiBankInstance.address)
	const addressesForVC = {
		'bank': weiDaiBankInstance.address,
		'weidai': weiDaiInstance.address,
		'pre': preInstance.address
	}
	console.log(JSON.stringify(addressesForVC, null, 4))
}

let loadVCAddress = (network) => {
	const fileLocation = './client/src/networkVersionControllers.json'
	const fs = require('fs')
	const data = fs.readFileSync(fileLocation)
	const parse = (text) => JSON.parse(text)
	const object = parse(data)
	return object["networks"].filter(n => n.name == network)[0].address
}

