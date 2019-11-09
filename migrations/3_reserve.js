const PotReserve = artifacts.require("PotReserve")
const MockPot = artifacts.require("MockPot")
const MockDai = artifacts.require("MockDai")
const MockVat = artifacts.require("MockVat")
const WeiDaiBank = artifacts.require("WeiDaiBank")

module.exports = async function (deployer, network, accounts) {
	var potReserveInstance

	await deployer.deploy(PotReserve)
	potReserveInstance = await PotReserve.deployed()
	await potReserveInstance.enable(true)

	if (network === 'development' || network == 'gethdev') {

		await deployer.deploy(MockDai)
		await deployer.deploy(MockPot)
		await deployer.deploy(MockVat)

		const mockPotInstance = await MockPot.deployed()
		const mockDaiInstance = await MockDai.deployed()
		const mockVatInstance = await MockVat.deployed()
		await potReserveInstance.setMakerAddresses(mockPotInstance.address,mockDaiInstance.address,mockVatInstance.address)
		await potReserveInstance.approveForTesting()

		await mockPotInstance.setDaiAddress(mockDaiInstance.address);
		await mockDaiInstance.transfer(mockPotInstance.address,"1000000000000000000",{from:accounts[0]})
		const bankInstance = await WeiDaiBank.deployed()
		await potReserveInstance.setBank(bankInstance.address)
	}
	else if (network === 'main' || network=='main-fork') {
		
	}
	else if (network == 'kovan-fork' || network == 'kovan') {
		
	}

}
