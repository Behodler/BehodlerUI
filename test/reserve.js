
const async = require('./helpers/async.js')
const expectThrow = require('./helpers/expectThrow').handle
const time = require('./helpers/time')

const test = async.test
const setup = async.setup
const potReserve = artifacts.require("PotReserve")
const mockDai = artifacts.require("MockDai")
const mockPot = artifacts.require("MockPot")

contract('Reserve', accounts => {
	let potReserveInstance, mockDaiInstance, primaryBank, mockPotInstance
	setup(async () => {

		mockDaiInstance = await mockDai.deployed()
		potReserveInstance = await potReserve.deployed()
		mockPotInstance = await mockPot.deployed()
		await potReserveInstance.setBank(accounts[0], { from: accounts[0] })
		primaryBank = accounts[0]
	})


	test("deposit and withdraw as not bank fails", async () => {
		await expectThrow(potReserveInstance.deposit(10, { from: accounts[2] }), "only the bank can invoke this function")
		await expectThrow(potReserveInstance.withdraw(10, { from: accounts[2] }), "only the bank can invoke this function")
	})

	test("transfer to another reserve transfers the dai balance", async () => {
		const balance = (await potReserveInstance.balance.call()).toNumber()
		await mockDaiInstance.approve(potReserveInstance.address, "1000000")
		await potReserveInstance.deposit(100, { from: primaryBank });
		const balanceAfter = (await potReserveInstance.balance.call()).toNumber()
		assert.equal(balanceAfter, balance + 100)
		const newReserveInstance = (await potReserve.new())

		const newReserveBalance = (await mockDaiInstance.balanceOf.call(newReserveInstance.address)).toNumber()
		await potReserveInstance.transferToNewReserve(newReserveInstance.address, { from: primaryBank })
		const newReserveBalanceAfter = (await mockDaiInstance.balanceOf.call(newReserveInstance.address)).toNumber()

		assert.equal(newReserveBalanceAfter, newReserveBalance + 100)
		const oldReserveBalance = (await potReserveInstance.balance.call()).toNumber()
		assert.equal(oldReserveBalance, 0)
	})

	test("deposit and waiting 10 blocks grows the balance by 10%", async () => {
		await mockDaiInstance.approve(potReserveInstance.address, "1000000")
		await potReserveInstance.deposit(100, { from: primaryBank });
		let blockNumber = await web3.eth.getBlockNumber()

		const finalBlockNumber = blockNumber + 9
		for (; blockNumber < finalBlockNumber; blockNumber = await time.advanceBlock());
		await mockPotInstance.mockGrow(potReserveInstance.address)
		const potBalanceAfterGrowth = (await potReserveInstance.balance.call()).toNumber()
		assert.equal(potBalanceAfterGrowth, 110)

	})

	test("withdrawing after 20 blocks give a 20% larger balance", async () => {
		await mockDaiInstance.approve(potReserveInstance.address, "1000000")
		await potReserveInstance.deposit(100, { from: primaryBank });
		let blockNumber = await web3.eth.getBlockNumber()

		const finalBlockNumber = blockNumber + 19
		for (; blockNumber < finalBlockNumber; blockNumber = await time.advanceBlock());
		await potReserveInstance.withdraw(120, {from:primaryBank})
		const daiBalanceAfter = (await mockDaiInstance.balanceOf.call(primaryBank)).toString()
		assert.equal(daiBalanceAfter, "100000000129999999998999820")
	})
})