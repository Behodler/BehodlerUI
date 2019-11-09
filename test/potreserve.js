
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
		assert.isAtLeast(balanceAfter, balance + 99)
		const newReserveInstance = (await potReserve.new())

		const newReserveBalance = (await mockDaiInstance.balanceOf.call(newReserveInstance.address)).toNumber()
		await potReserveInstance.transferToNewReserve(newReserveInstance.address, { from: primaryBank })
		const newReserveBalanceAfter = (await mockDaiInstance.balanceOf.call(newReserveInstance.address)).toNumber()

		assert.isAtLeast(newReserveBalanceAfter, newReserveBalance + 99)
		const oldReserveBalance = (await potReserveInstance.balance.call()).toNumber()
		assert.equal(oldReserveBalance, 0)
	})

	test("deposit and waiting increases balance, withdrawing also does", async () => {
		await mockDaiInstance.approve(potReserveInstance.address, -1) // bank giving approval
		let balanceBefore = (await potReserveInstance.balance.call({ from: primaryBank })).toNumber()
		if (balanceBefore > 0)
			await potReserveInstance.withdraw(balanceBefore, { from: primaryBank })

		const pieBefore = (await mockPotInstance.pie.call(potReserveInstance.address)).toString()
		assert.equal(pieBefore, "0")

		await potReserveInstance.deposit("1000", { from: primaryBank });

		let balanceAfter = (await potReserveInstance.balance.call()).toNumber()
		assert.isAtLeast(balanceAfter, 998) //precision loss

		let blockNumber = await web3.eth.getBlockNumber()
		for (let i = 0; i < 100; i++)
			await mockPotInstance.drip();

		const potBalanceAfterGrowth = (await potReserveInstance.balance.call({ from: primaryBank })).toNumber()
		assert.isAtLeast(potBalanceAfterGrowth, 1060)

		blockNumber = await web3.eth.getBlockNumber()
		finalBlockNumber = blockNumber + 100
		for (; blockNumber < finalBlockNumber; blockNumber = await time.advanceBlock());

		const daiBalanceBefore = await mockDaiInstance.balanceOf.call(primaryBank)
		await mockDaiInstance.transfer(accounts[8], daiBalanceBefore, { from: primaryBank }) //empty bank of dai
		await potReserveInstance.withdraw(1070, { from: primaryBank })
		balanceAfter = (await mockDaiInstance.balanceOf.call(primaryBank)).toNumber()
		assert.equal(balanceAfter, 1070)
	})
})