
const PRE = artifacts.require("PatienceRegulationEngine")

module.exports = async function (deployer, network, accounts) {
	var preInstance, vcInstance
	await deployer.deploy(PRE)

	preInstance = await PRE.deployed();

	const vcAddress = loadVCAddress(network)
	
	await preInstance.setVersionController(vcAddress)
	console.log("PRE new address: "+ preInstance.address)
}

let loadVCAddress = (network) => {
	const fileLocation = './client/src/networkVersionControllers.json'
	const fs = require('fs')
	const data = fs.readFileSync(fileLocation)
	const parse = (text) => JSON.parse(text)
	const object = parse(data)
	return object["networks"].filter(n => n.name == network)[0].address
}