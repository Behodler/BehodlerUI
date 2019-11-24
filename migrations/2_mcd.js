
const WeiDai = artifacts.require('WeiDai')
const WeiDaiBank = artifacts.require('WeiDaiBank')
const PotReserve = artifacts.require('PotReserve')
const PatienceRegulationEngine = artifacts.require('PatienceRegulationEngine')

module.exports = async function (deployer, network, accounts) {
	let vcAddress = loadVCAddress(network)
	WeiDai.synchronization_timeout = 2000;
	WeiDaiBank.synchronization_timeout = 2000;
	PotReserve.synchronization_timeout = 2000;
	PatienceRegulationEngine.synchronization_timeout = 1500;

	await deployer.deploy(WeiDai)
	const weiDaiInstance = await WeiDai.deployed()
	await weiDaiInstance.setVersionController(vcAddress)

	await deployer.deploy(PatienceRegulationEngine)
	const preInstance = await PatienceRegulationEngine.deployed()
	await preInstance.setVersionController(vcAddress)

	await deployer.deploy(WeiDaiBank)
	const weiDaiBankInstance = await WeiDaiBank.deployed()
	await weiDaiBankInstance.setVersionController(vcAddress)

	await deployer.deploy(PotReserve)
	const potReserveInstance = await PotReserve.deployed()
	const makerAddresses = { pot: '', dai: '', daijoin: '' }

	if (network == 'kovan-fork' || network == 'kovan') {
		makerAddresses.pot = '0xea190dbdc7adf265260ec4da6e9675fd4f5a78bb'
		makerAddresses.dai = '0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa'
		makerAddresses.daijoin = '0x5aa71a3ae1c0bd6ac27a1f28e1415fffb6f15b8c'
	} else if (network === 'main' || network == 'main-fork') {
		makerAddresses.pot = '0x197e90f9fad81970ba7976f33cbd77088e5d7cf7'
		makerAddresses.dai = '0x6b175474e89094c44da98b954eedeac495271d0f'
		makerAddresses.daijoin = '0x9759a6ac90977b93b58547b4a71c78317f391a28'
	}
	console.log("setting maker addresses for Pot")

	await potReserveInstance.setMakerAddresses(makerAddresses.pot, makerAddresses.dai, makerAddresses.daijoin, weiDaiBankInstance.address)

	console.log("setting bank for Pot")
	console.log("setting pot reserve address for bank")
	await weiDaiBankInstance.setReserveAddress(potReserveInstance.address)

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

