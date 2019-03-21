
const async = require('./helpers/async.js')
const expectThrow = require('./helpers/expectThrow').handle
const time = require('./helpers/time')

const test = async.test
const setup = async.setup
const bank = artifacts.require("WeiDaiBank")
const pre = artifacts.require("PatienceRegulationEngine")
const mockDai = artifacts.require("MockDai")
const weidai = artifacts.require("WeiDai")

const setupTests = async (accounts) => {
	var bi = await bank.deployed()
	var pi = await pre.deployed()
	var mi = await mockDai.deployed()
	var wd = await weidai.deployed()
	for (var i = 0; i < accounts.length; i++)
		mi.transfer(accounts[i], "10000", { from: accounts[0] })
	return { bi, pi, mi, wd }
}

contract('Patience Regulation Engine: SPLIT', accounts => {
	let bankInstance, preInstance, mockDaiInstance
	setup(async () => {
		const { bi, pi, mi } = await setupTests(accounts)
		bankInstance = bi
		preInstance = pi
		mockDaiInstance = mi
	})

	test("buy split not as percentage fails", async () => {
		const initialExchangeRate = (await bankInstance.daiPerMyriadWeidai.call()).toString()
		assert.equal(initialExchangeRate, "100")

		await mockDaiInstance.approve(bank.address, "10000", { from: accounts[1] })
		expectThrow(preInstance.buyWeiDai("1000", "101", { from: accounts[1] }), "split is a % expressed as an integer between 0 and 100")
	})
})

contract('Patience Regulation Engine: BUY 1', accounts => {
	let bankInstance, preInstance, mockDaiInstance
	setup(async () => {
		const { bi, pi, mi } = await setupTests(accounts)
		bankInstance = bi
		preInstance = pi
		mockDaiInstance = mi
	})

	test("buying initial weidai for 2 accounts both get exchange rate of 1/1000.", async () => {
		const initialExchangeRate = (await bankInstance.daiPerMyriadWeidai.call()).toString()
		assert.equal(initialExchangeRate, "100")

		await mockDaiInstance.approve(bank.address, "10000", { from: accounts[1] })
		await preInstance.buyWeiDai("1000", "20", { from: accounts[1] })
		const firstBuyExchangeRate = (await bankInstance.daiPerMyriadWeidai.call()).toString()
		assert.equal(firstBuyExchangeRate, "100")

		await mockDaiInstance.approve(bank.address, "10000", { from: accounts[4] })
		await preInstance.buyWeiDai("1500", "0", { from: accounts[4] })
		const secondBuyExchangeRate = (await bankInstance.daiPerMyriadWeidai.call()).toString()
		assert.equal(secondBuyExchangeRate, "100")
	})
})


contract('Patience Regulation Engine: APPROVE', accounts => {
	let bankInstance, preInstance, mockDaiInstance
	setup(async () => {
		const { bi, pi, mi } = await setupTests(accounts)
		bankInstance = bi
		preInstance = pi
		mockDaiInstance = mi
	})

	test("not approving bank to take dai fails", async () => {
		const initialExchangeRate = (await bankInstance.daiPerMyriadWeidai.call()).toString()
		assert.equal(initialExchangeRate, "100")

		expectThrow(preInstance.buyWeiDai("1000", "20", { from: accounts[1] }), "{}")
	})
})


contract('Patience Regulation Engine: Premature', accounts => {
	let bankInstance, preInstance, mockDaiInstance
	setup(async () => {
		const { bi, pi, mi } = await setupTests(accounts)
		bankInstance = bi
		preInstance = pi
		mockDaiInstance = mi
	})

	test("prematurely claiming incurs penalty, donates to donation address, strengthens exchange rate", async () => {
		// const initialExchangeRate = (await bankInstance.daiPerMyriadWeidai.call()).toString()
		// assert.equal(initialExchangeRate, "1000")

		// await mockDaiInstance.approve(bank.address, "10000", { from: accounts[1] })
		// await preInstance.buyWeiDai("1000", "20", { from: accounts[1] })

	})
})


contract('Patience Regulation Engine: Patient', accounts => {
	let bankInstance, preInstance, mockDaiInstance, weidaiInstance
	setup(async () => {
		const { bi, pi, mi, wd } = await setupTests(accounts)
		bankInstance = bi
		preInstance = pi
		mockDaiInstance = mi
		weidaiInstance = wd
	})

	test("withdrawing after duration incurs no penalty, exchange rate unaffected", async () => { // test will be long running. see https://medium.com/edgefund/time-travelling-truffle-tests-f581c1964687
		const account = accounts[6]

		const currentBlock = await web3.eth.getBlockNumber();
		const currentClaimWaitWindow = (await preInstance.getClaimWaitWindow.call()).toNumber();
		const claimWindowsPerAdjustment = (await preInstance.getClaimWindowsPerAdjustment.call()).toNumber()
		const lastAdjustmentBlock = (await preInstance.getLastAdjustmentBlockNumber.call()).toNumber()
		const nextAdjustmentBlock = (currentClaimWaitWindow * claimWindowsPerAdjustment) + lastAdjustmentBlock
		const blocksUntilNextAdjustment = nextAdjustmentBlock - currentBlock

		assert.isAtLeast(blocksUntilNextAdjustment, currentClaimWaitWindow * 2, "too few blocks to next adjustment. Consider resetting ganache.")

		const currentLockedWeiDai = (await preInstance.getLockedWeiDai.call(account)).toNumber()

		assert.equal(currentLockedWeiDai, 0)

		const exchangeRateBeforeTransactions = (await bankInstance.daiPerMyriadWeidai.call()).toNumber()
		await mockDaiInstance.approve(bank.address, "10000", { from: account })
		await preInstance.buyWeiDai("100", "0", { from: account })
		const purchaseBlock = (await preInstance.getBlockOfPurchase({ from: account })).toNumber()

		for (let blockNumber = (await web3.eth.getBlockNumber()); blockNumber <= purchaseBlock + currentClaimWaitWindow; blockNumber = (await time.advanceBlock()));

		const adjustmentWeightBefore = (await preInstance.getCurrentAdjustmentWeight.call()).toNumber();
		const marginalPenaltyBefore = (await preInstance.getCurrentPenalty.call()).toNumber();
		const weidaiBalanceBefore = (await weidaiInstance.balanceOf.call(account)).toNumber()

		await preInstance.claimWeiDai({ from: account })

		const exchangeRateAfterTransactions = (await bankInstance.daiPerMyriadWeidai.call()).toNumber()
		const expectedWeiDai = 100 * exchangeRateAfterTransactions

		const weidaiBalanceAfter = (await weidaiInstance.balanceOf.call(account)).toNumber()

		const marginalPenaltyAfter = (await preInstance.getCurrentPenalty.call()).toNumber();
		const adjustmentWeightAfter = (await preInstance.getCurrentAdjustmentWeight.call()).toNumber();


		console.log("exchange rate: " + exchangeRateAfterTransactions)
		assert.equal(exchangeRateBeforeTransactions, exchangeRateAfterTransactions)
		assert.equal(adjustmentWeightBefore + 1000000, adjustmentWeightAfter)
		assert.equal(marginalPenaltyBefore, marginalPenaltyAfter)
		assert.equal(weidaiBalanceBefore + expectedWeiDai, weidaiBalanceAfter)
	})
})


contract('Patience Regulation Engine: Redemption', accounts => {
	let bankInstance, preInstance, mockDaiInstance
	setup(async () => {
		const { bi, pi, mi, wd } = await setupTests(accounts)
		bankInstance = bi
		preInstance = pi
		mockDaiInstance = mi
		weidaiInstance = wd
	})
	test("redeeming weidai from bank incurrs 2% fee, pushes up exchange rate, transfers dai from bank to withdrawer", async () => {
		const account = accounts[8]

		const currentBlock = await web3.eth.getBlockNumber();
		const currentClaimWaitWindow = (await preInstance.getClaimWaitWindow.call()).toNumber();
		const claimWindowsPerAdjustment = (await preInstance.getClaimWindowsPerAdjustment.call()).toNumber()
		const lastAdjustmentBlock = (await preInstance.getLastAdjustmentBlockNumber.call()).toNumber()
		const nextAdjustmentBlock = (currentClaimWaitWindow * claimWindowsPerAdjustment) + lastAdjustmentBlock
		const blocksUntilNextAdjustment = nextAdjustmentBlock - currentBlock

		assert.isAtLeast(blocksUntilNextAdjustment, currentClaimWaitWindow * 2, "too few blocks to next adjustment. Consider resetting ganache.")

		const currentLockedWeiDai = (await preInstance.getLockedWeiDai.call(account)).toNumber()

		assert.equal(currentLockedWeiDai, 0)
		await mockDaiInstance.approve(bank.address, "10000", { from: account })
		await preInstance.buyWeiDai("1000", "0", { from: account })
		const purchaseBlock = (await preInstance.getBlockOfPurchase({ from: account })).toNumber()

		for (let blockNumber = (await web3.eth.getBlockNumber()); blockNumber <= purchaseBlock + currentClaimWaitWindow; blockNumber = (await time.advanceBlock()));

		await preInstance.claimWeiDai({ from: account })

		const exchangeRateBeforeRedemption = (await bankInstance.daiPerMyriadWeidai.call()).toNumber()
		const weidaiBeforeRedemption = (await weidaiInstance.balanceOf.call(account)).toNumber()
		const weiDaiToRedeem = Math.trunc(weidaiBeforeRedemption * 0.5);
		const daiValueOfWeiDai = (exchangeRateBeforeRedemption * weiDaiToRedeem) / 10000
		const daiBeforeRedemption = (await mockDaiInstance.balanceOf.call(account)).toNumber()

		assert.isAtLeast(weidaiBeforeRedemption, 1000, "sanity check")

		await bankInstance.redeemWeiDai(weiDaiToRedeem, { from: account })

		const daiAfterRedemption = (await mockDaiInstance.balanceOf.call(account)).toNumber()
		const weidaiAfterRedemption = (await weidaiInstance.balanceOf.call(account)).toNumber()
		const exchangeRateAfterRedemption = (await bankInstance.daiPerMyriadWeidai.call()).toNumber()
		assert.equal(daiAfterRedemption, daiBeforeRedemption + (0.98 * daiValueOfWeiDai))
		assert.equal(weidaiAfterRedemption, 50000)
		assert.equal(exchangeRateBeforeRedemption+2, exchangeRateAfterRedemption)
	})
})

contract('Patience Regulation Engine: Premature: TimeStamp stability', accounts => {
	let bankInstance, preInstance, mockDaiInstance
	setup(async () => {
		const { bi, pi, mi } = await setupTests(accounts)
		bankInstance = bi
		preInstance = pi
		mockDaiInstance = mi
	})
	test("purchasing wei from multiple users doesn't affect last adjustment timestamp", async () => {

	})

})