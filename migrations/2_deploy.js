const  Updai = artifacts.require("Updai")
const GeneratorContract = artifacts.require("Generator")
const HotPotato = artifacts.require("HotPotato") 

  //Dai address: 0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359

module.exports = async function (deployer) {
	var updaiInstance, generatorInstance, hotPotatoInstance

	await deployer.deploy(Updai);
	await deployer.deploy(GeneratorContract);
	await deployer.deploy(HotPotato);

	updaiInstance = await Updai.deployed()
	generatorInstance = await GeneratorContract.deployed()
	hotPotatoInstance = await HotPotato.deployed()

	await updaiInstance.setBank(generatorInstance.address, true);
	await updaiInstance.setBank(hotPotatoInstance.address, true);
	
	await generatorInstance.setDependencies(updaiInstance.address);
}