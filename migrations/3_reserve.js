const PotReserve = artifacts.require("PotReserve")
const MockPot = artifacts.require("MockPot")
const MockDai = artifacts.require("MockDai")
const WeiDaiBank = artifacts.require("WeiDaiBank")

module.exports = async function (deployer, network, accounts) {
	var mockPotInstance, potReserveInstance

	await deployer.deploy(PotReserve)
	potReserveInstance = await PotReserve.deployed()

	if (network === 'development' || network == 'gethdev') {

		await deployer.deploy(MockDai)
		await deployer.deploy(MockPot)
		mockPotInstance = await MockPot.deployed()
		const mockDaiInstance = await MockDai.deployed()

		await mockPotInstance.setDaiAddress(mockDaiInstance.address);
		await mockDaiInstance.transfer(mockPotInstance.address,"1000000",{from:accounts[0]})
		await potReserveInstance.setMakerAddresses(mockPotInstance.address,mockDaiInstance.address)
		const bankInstance = await WeiDaiBank.deployed()
		await potReserveInstance.setBank(bankInstance.address)
	}
	else if (network === 'main' || network=='main-fork') {
		
	}
	else if (network == 'kovan-fork' || network == 'kovan') {
		
	}

}
