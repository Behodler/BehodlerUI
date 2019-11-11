
const async = require('./helpers/async.js')
const expectThrow = require('./helpers/expectThrow').handle
const time = require('./helpers/time')

const test = async.test
const setup = async.setup
const inertReserve = artifacts.require("InertReserve")
const mockDai = artifacts.require("MockDai")

contract('Reserve', accounts => {
	let inertReserveInstance, mockDaiInstance, primaryBank, mockPotInstance
	setup(async () => {

		mockDaiInstance = await mockDai.deployed()
		inertReserveInstance = await inertReserve.deployed()
		await inertReserveInstance.setBank(accounts[0], { from: accounts[0] })
		primaryBank = accounts[0]
	})


	test("deposit and withdraw as not bank fails", async () => {
		await expectThrow(inertReserveInstance.deposit(10, { from: accounts[2] }), "only the bank can invoke this function")
		await expectThrow(inertReserveInstance.withdraw(10, { from: accounts[2] }), "only the bank can invoke this function")
	})

	test("transfer to another reserve transfers the dai balance", async () => {
		const balance = (await inertReserveInstance.balance.call()).toNumber()
		await mockDaiInstance.approve(inertReserveInstance.address, "-1")
		await inertReserveInstance.deposit(100, { from: primaryBank });
		const balanceAfter = (await inertReserveInstance.balance.call()).toNumber()
		assert.equal(balanceAfter,100)
		const newReserveInstance = (await inertReserve.new())

		const newReserveBalance = (await mockDaiInstance.balanceOf.call(newReserveInstance.address)).toNumber()
		await inertReserveInstance.transferToNewReserve(newReserveInstance.address, { from: primaryBank })
		const newReserveBalanceAfter = (await mockDaiInstance.balanceOf.call(newReserveInstance.address)).toNumber()

		assert.equal(newReserveBalanceAfter, newReserveBalance + 100)
		const oldReserveBalance = (await inertReserveInstance.balance.call()).toNumber()
		assert.equal(oldReserveBalance, 0)
	})

	test("deposit and withdrawing the same amount leaves balance at zero", async ()=>{
		await mockDaiInstance.approve(inertReserveInstance.address, -1) // bank giving approval
		let balanceBefore = (await inertReserveInstance.balance.call({ from: primaryBank })).toNumber()
		assert.equal(balanceBefore,0)
		await inertReserveInstance.deposit("1000", { from: primaryBank });
		let balanceAfter = (await inertReserveInstance.balance.call({ from: primaryBank })).toNumber()
		assert.equal(balanceAfter,1000)

	 	const daiBalanceBefore = await mockDaiInstance.balanceOf.call(primaryBank)
		await mockDaiInstance.transfer(accounts[8], daiBalanceBefore, { from: primaryBank }) //empty bank of dai
		 
		await inertReserveInstance.withdraw(305,{from:primaryBank})
		balanceAfter = (await inertReserveInstance.balance.call({ from: primaryBank })).toNumber()
		assert.equal(balanceAfter,695)

		let daiBalance = (await mockDaiInstance.balanceOf.call(primaryBank)).toNumber()
		assert.equal(daiBalance,305)

		await inertReserveInstance.withdraw(695,{from:primaryBank})
		balanceAfter = (await inertReserveInstance.balance.call({ from: primaryBank })).toNumber()
		assert.equal(balanceAfter,0)
		daiBalance = (await mockDaiInstance.balanceOf.call(primaryBank)).toNumber()
		assert.equal(daiBalance,1000)

		expectThrow(inertReserveInstance.withdraw(1,{from:primaryBank}),"deposit failed on transfer")
	})
})