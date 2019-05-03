
const async = require('./helpers/async.js')
const expectThrow = require('./helpers/expectThrow').handle
const test = async.test
const setup = async.setup
const time = require('./helpers/time')

const weidai = artifacts.require("WeiDai")
const bank = artifacts.require("WeiDaiBank")
const mockDai = artifacts.require("MockDai")
const pre = artifacts.require("PatienceRegulationEngine")

contract('WeiDai', accounts => {
	let weidaiInstance, bankInstance, mockDaiInstance, preInstance
	setup(async () => {
		weidaiInstance = await weidai.deployed()
		bankInstance = await bank.deployed()
		mockDaiInstance = await mockDai.deployed()
		preInstance = await pre.deployed()
	})

	test("non bank can't issue", async () => {
		await expectThrow(weidaiInstance.issue(accounts[1], "100", { from: accounts[7] }), 'requires bank authorization')
	})

	test("non-bank can't burn", async () => {
		const arsonist = accounts[5]
		const holder = accounts[0]

		//purchase weidai section
		await mockDaiInstance.approve(bank.address, "10000", { from: holder })
		await preInstance.buyWeiDai("1500", "0", { from: holder })
		const purchaseBlock = (await preInstance.getBlockOfPurchase({ from: holder })).toNumber()
		const currentClaimWaitWindow = (await preInstance.getClaimWaitWindow.call()).toNumber();
		for (let blockNumber = (await web3.eth.getBlockNumber()); blockNumber <= purchaseBlock + currentClaimWaitWindow * 2; blockNumber = (await time.advanceBlock()));
		await preInstance.claimWeiDai()
		//purchase weidai complete


		await expectThrow(weidaiInstance.burn(holder, "50", { from: arsonist }), 'unauthorized to burn WeiDai')
		const weidaiBefore = await weidaiInstance.balanceOf.call(holder)
		await weidaiInstance.approveArson(arsonist, 50, { from: holder })
		const allowance = await weidaiInstance.getArsonAllowance.call(arsonist, holder)
		assert.equal(allowance, 50)
	
		await weidaiInstance.burn(holder, "50", { from: arsonist })
		const weidaiAfter = await weidaiInstance.balanceOf.call(holder)
		assert.equal(weidaiBefore - 50, weidaiAfter)
		await weidaiInstance.burn(holder, "100", { from: holder })
		const weidaiAfterSelfBurn = await weidaiInstance.balanceOf(holder)
		assert.equal(weidaiAfter - 100, weidaiAfterSelfBurn)
	})

	test("bank can't burn more than totalSupply", async () => {
		let balanceOfAccount1 = parseInt((await weidaiInstance.balanceOf.call(accounts[1])))
		let overflowAmount = `${balanceOfAccount1 + 1}`
		await expectThrow(weidaiInstance.burn(accounts[1], overflowAmount, { from: bankInstance.address }), "{}")//openzeppelin safemath seems to throw nothing in their require statements
	})

})