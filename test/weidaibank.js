
const async = require('./helpers/async.js')
const expectThrow = require('./helpers/expectThrow').handle
const time = require('./helpers/time')
const test = async.test
const setup = async.setup
const bank = artifacts.require("WeiDaiBank")
const pre = artifacts.require("PatienceRegulationEngine")
const mockDai = artifacts.require("MockDai")
const weiDai = artifacts.require("WeiDai")

contract('bank', accounts => {
	let bankInstance, preInstance, mockDaiInstance, weidaiInstance
	setup(async () => {
		bankInstance = await bank.deployed()
		preInstance = await pre.deployed()
		mockDaiInstance = await mockDai.deployed()
		weidaiInstance = await weiDai.deployed()
		for (var i = 0; i < accounts.length; i++)
			await mockDaiInstance.transfer(accounts[i], "10000", { from: accounts[0] })
	})

	test("non pre can't issue weidai through bank", async () => {
		let randomAddress = accounts[7]
		assert.notEqual(randomAddress, preInstance.address)
		await expectThrow(bankInstance.issue(accounts[0], "100", "200", { from: randomAddress }), 'only patience regulation engine can invoke this function')
	})

	test("only primary can trigger a donation withdrawal", async () => {
		let randomAddress = accounts[4]
		await expectThrow(bankInstance.withdrawDonations({ from: randomAddress }), '{}')
	})

	test("redeeming after buying preserves donation split", async () => {
		const account = accounts[6]
		const donationAddress = await bankInstance.getDonationAddress()

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
		await preInstance.buyWeiDai("100", "13", { from: account })
		const purchaseBlock = (await preInstance.getBlockOfPurchase({ from: account })).toNumber()

		for (let blockNumber = (await web3.eth.getBlockNumber()); blockNumber <= purchaseBlock + currentClaimWaitWindow; blockNumber = (await time.advanceBlock()));

		await preInstance.claimWeiDai({ from: account })
		await bankInstance.withdrawDonations({ from: accounts[0] })
		const donationWeiDaiBalanceBefore = (await weidaiInstance.balanceOf.call(donationAddress)).toNumber()


		await weidaiInstance.approve(bank.address, "10000", { from: account })
		await bankInstance.redeemWeiDai("1000", { from: account })
		const expectedDonation = 2 //13% of 2%
		await bankInstance.withdrawDonations({ from: accounts[0] })

		const donationWeiDaiBalanceAfter = (await weidaiInstance.balanceOf.call(donationAddress)).toNumber()
		assert.equal(donationWeiDaiBalanceAfter, donationWeiDaiBalanceBefore + expectedDonation)
	})


	test("redeeming everthing donates nothing", async () => {
		const account = accounts[6]
		const donationAddress =  await bankInstance.getDonationAddress()

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
		await preInstance.buyWeiDai("100", "13", { from: account })
		const purchaseBlock = (await preInstance.getBlockOfPurchase({ from: account })).toNumber()

		for (let blockNumber = (await web3.eth.getBlockNumber()); blockNumber <= purchaseBlock + currentClaimWaitWindow; blockNumber = (await time.advanceBlock()));

		await preInstance.claimWeiDai({ from: account })
		await bankInstance.withdrawDonations({ from: accounts[0] })


		const donationAmount = (await weidaiInstance.balanceOf.call(donationAddress)).toNumber()
		await weidaiInstance.transfer(account, donationAmount, { from: donationAddress })
		const donationWeiDaiBalanceBefore = (await weidaiInstance.balanceOf.call(donationAddress)).toNumber()
		const existingWeiDai = (await weidaiInstance.balanceOf.call(account)).toNumber()
		const totalSupply = (await weidaiInstance.totalSupply.call()).toNumber()

		assert.equal(existingWeiDai, totalSupply, 'user does not own it all')

		await weidaiInstance.approve(bank.address, existingWeiDai, { from: account })
		await bankInstance.redeemWeiDai(existingWeiDai, { from: account })
		const expectedDonation = 0
		await bankInstance.withdrawDonations({ from: accounts[0] })

		const donationWeiDaiBalanceAfter = (await weidaiInstance.balanceOf.call(donationAddress)).toNumber()
		assert.equal(donationWeiDaiBalanceAfter, donationWeiDaiBalanceBefore + expectedDonation)
	})

	test("redeeming without ever having bought defaults to 10% split", async () => {
		const account = accounts[6]
		const otherAccount = accounts[9]
		const donationAddress =  await bankInstance.getDonationAddress()

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
		await preInstance.buyWeiDai("100", "13", { from: account })
		const purchaseBlock = (await preInstance.getBlockOfPurchase({ from: account })).toNumber()

		for (let blockNumber = (await web3.eth.getBlockNumber()); blockNumber <= purchaseBlock + currentClaimWaitWindow; blockNumber = (await time.advanceBlock()));

		await preInstance.claimWeiDai({ from: account })
		await bankInstance.withdrawDonations({ from: accounts[0] })


		const donationAmount = (await weidaiInstance.balanceOf.call(donationAddress)).toNumber()
		await weidaiInstance.transfer(account, donationAmount, { from: donationAddress })
		const donationWeiDaiBalanceBefore = (await weidaiInstance.balanceOf.call(donationAddress)).toNumber()

		const existingWeiDai = (await weidaiInstance.balanceOf.call(account)).toNumber()
		const totalSupply = (await weidaiInstance.totalSupply.call()).toNumber()

		assert.equal(existingWeiDai, totalSupply, 'user does not own it all')

		await weidaiInstance.transfer(otherAccount, existingWeiDai, { from: account })

		await weidaiInstance.approve(bank.address, 4000, { from: otherAccount })
		await bankInstance.redeemWeiDai(4000, { from: otherAccount })
		const expectedDonation = 8 //10% of 2%
		await bankInstance.withdrawDonations({ from: accounts[0] })

		const donationWeiDaiBalanceAfter = (await weidaiInstance.balanceOf.call(donationAddress)).toNumber()
		assert.equal(donationWeiDaiBalanceAfter, donationWeiDaiBalanceBefore + expectedDonation)
	})

	test("manually changing donation split changes it on redeem", async () => {
		const account = accounts[6]
		const otherAccount = accounts[4]
		const donationAddress =  await bankInstance.getDonationAddress()

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
		await preInstance.buyWeiDai("100", "13", { from: account })
		const purchaseBlock = (await preInstance.getBlockOfPurchase({ from: account })).toNumber()

		for (let blockNumber = (await web3.eth.getBlockNumber()); blockNumber <= purchaseBlock + currentClaimWaitWindow; blockNumber = (await time.advanceBlock()));

		await preInstance.claimWeiDai({ from: account })
		await bankInstance.withdrawDonations({ from: accounts[0] })


		const donationAmount = (await weidaiInstance.balanceOf.call(donationAddress)).toNumber()
		await weidaiInstance.transfer(account, donationAmount, { from: donationAddress })
		const donationWeiDaiBalanceBefore = (await weidaiInstance.balanceOf.call(donationAddress)).toNumber()

		await weidaiInstance.transfer(otherAccount, 5000, { from: account })

		await weidaiInstance.approve(bank.address, 4000, { from: otherAccount })
		await preInstance.setDonationSplit(35, { from: otherAccount })
		await bankInstance.redeemWeiDai(4000, { from: otherAccount })
		const expectedDonation = 28 //35% of 2%
		await bankInstance.withdrawDonations({ from: accounts[0] })

		const donationWeiDaiBalanceAfter = (await weidaiInstance.balanceOf.call(donationAddress)).toNumber()
		assert.equal(donationWeiDaiBalanceAfter, donationWeiDaiBalanceBefore + expectedDonation)
	})
})
