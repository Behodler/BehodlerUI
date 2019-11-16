const PotReserve = artifacts.require("PotReserve")
const MockPot = artifacts.require("MockPot")
const MockDai = artifacts.require("MockDai")
const MockVat = artifacts.require("MockVat")
const WeiDaiBank = artifacts.require("WeiDaiBank")
const InertReserve = artifacts.require("InertReserve")
const MockDaiJoin = artifacts.require("MockDaiJoin")

module.exports = async function (deployer, network, accounts) {
	var potReserveInstance, inertReserveInstance, bankInstance

	await deployer.deploy(PotReserve)
	potReserveInstance = await PotReserve.deployed()
	await potReserveInstance.enable(true)

	await deployer.deploy(InertReserve)
	inertReserveInstance = await InertReserve.deployed()
	if (network === 'development' || network == 'gethdev') {

		await deployer.deploy(MockPot)
		await deployer.deploy(MockVat)
		await deployer.deploy(MockDaiJoin)

		const mockPotInstance = await MockPot.deployed()
		const mockDaiInstance = await MockDai.deployed()
		const mockVatInstance = await MockVat.deployed()
		const mockDaiJoinInstance = await MockDaiJoin.deployed()

		bankInstance = await WeiDaiBank.deployed()

		await mockDaiJoinInstance.setMakerAddresses(mockVatInstance.address, mockDaiInstance.address);
		await potReserveInstance.setMakerAddresses(mockPotInstance.address, mockDaiInstance.address, mockDaiJoinInstance.address)
		await potReserveInstance.approveForTesting()

		await mockPotInstance.setDaiAddress(mockDaiInstance.address);
		await mockDaiInstance.transfer(mockPotInstance.address, "1000000000000000000", { from: accounts[0] })
		await potReserveInstance.setBank(bankInstance.address)
		await inertReserveInstance.setBank(bankInstance.address)
		await inertReserveInstance.setDaiAddress(mockDaiInstance.address)
		await bankInstance.setReserveAddress(inertReserveInstance.address)
	}
	else if (network === 'main' || network == 'main-fork') {

	}
	else if (network == 'kovan-fork' || network == 'kovan') {

	}

}
