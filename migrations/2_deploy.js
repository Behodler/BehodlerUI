const Updai = artifacts.require('Updai')
const GeneratorContract = artifacts.require('Generator')
const HotPotato = artifacts.require('HotPotato')
const MockDai = artifacts.require('MockDai')

module.exports = async function (deployer, network, accounts) {
	var updaiInstance, generatorInstance, hotPotatoInstance
	var daiAddress

	await deployer.deploy(Updai)
	await deployer.deploy(GeneratorContract)
	await deployer.deploy(HotPotato)

	updaiInstance = await Updai.deployed()
	generatorInstance = await GeneratorContract.deployed()
	hotPotatoInstance = await HotPotato.deployed()

	if (network === 'development') {
		await deployer.deploy(MockDai)
		daiAddress = (await MockDai.deployed()).address
		await generatorInstance.setVault(accounts[2]) //different to primary
	}
	else if (network === 'main') {
		daiAddress = '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359'
	}

	



	await updaiInstance.setBank(generatorInstance.address, true)
	await updaiInstance.setBank(hotPotatoInstance.address, true)

	await generatorInstance.setDependencies(updaiInstance.address, daiAddress)
}