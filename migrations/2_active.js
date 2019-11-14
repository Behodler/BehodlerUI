
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
	const makerAddresses = { pot: '', dai: '', vat: '' }

	if (network == 'kovan-fork' || network == 'kovan') {
		makerAddresses.pot = '0xea190dbdc7adf265260ec4da6e9675fd4f5a78bb'
		makerAddresses.dai = '0x4f96fe3b7a6cf9725f59d353f723c1bdb64ca6aa'
		makerAddresses.vat = '0xba987bdb501d131f766fee8180da5d81b34b69d9'
	}

	await weiDaiBankInstance.setReserveAddress(potReserveInstance.address)
	let vcAddress = loadVCAddress(network)
	await weiDaiBankInstance.setVersionController(vcAddress)
	await weiDaiInstance.setVersionController(vcAddress)
	await preInstance.setVersionController(vcAddress)

	await potReserveInstance.setMakerAddresses(makerAddresses.pot, makerAddresses.dai, makerAddresses.vat)
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

