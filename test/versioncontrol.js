
const async = require('./helpers/async.js')
const expectThrow = require('./helpers/expectThrow').handle
const test = async.test
const setup = async.setup
const pre = artifacts.require("PatienceRegulationEngine")
const bank = artifacts.require("WeiDaiBank")
const mockdai = artifacts.require("MockDai")
const versionController = artifacts.require("WeiDaiVersionController")
const weidai = artifacts.require("WeiDai")
const mockDai = artifacts.require("MockDai")

const time = require('./helpers/time')

contract('VersionController', accounts => {
	let bankInstance, daiInstance, vcInstance, preInstance, weidaiInstance, mockDaiInstance

	setup(async () => {
		bankInstance = await bank.deployed()
		preInstance = await pre.deployed()
		daiInstance = await mockdai.deployed()
		vcInstance = await versionController.deployed();
		weidaiInstance = await weidai.deployed();
		mockDaiInstance = await mockDai.deployed()
		for (var i = 0; i < accounts.length; i++)
			await daiInstance.transfer(accounts[i], "10000", { from: accounts[0] })
	})

	test("user with wrong version can't use any of the contracts", async () => {
		const account = accounts[3]
		const newWeiDai = (await weidai.new())
		const newDai = (await mockdai.new())
		const newPRE = (await pre.new())
		const newBank = (await bank.new())

		await vcInstance.setContractGroup(5, newWeiDai.address,
			newDai.address,
			newPRE.address,
			newBank.address,
			web3.utils.fromAscii("weidai5"),
			true)

		await newDai.transfer(account, "10000", { from: accounts[0] })
		await vcInstance.setActiveVersion(5, { from: account })

		await expectThrow(preInstance.buyWeiDai("1000", "20", { from: account }), "version mismatch")
	})

	test("assert new version created correctly", async () => {
		const newWeiDai = (await weidai.new())
		const newDai = (await mockdai.new())
		const newPRE = (await pre.new())
		const newBank = (await bank.new())

		await vcInstance.setContractGroup(100, newWeiDai.address,
			newDai.address,
			newPRE.address,
			newBank.address,
			web3.utils.fromAscii("kweidai"),
			true)

		const expectedWeiDai = await vcInstance.getWeiDai.call(100)
		const expectedDai = await vcInstance.getDai.call(100)
		const expectedPRE = await vcInstance.getPRE.call(100)
		const expectedWeiDaiBank = await vcInstance.getWeiDaiBank.call(100)
		const expectedNameSolidity = await vcInstance.getContractFamilyName.call(100)
		let expectedName = ''
		for (let i = 0; i < 7; i++) {
			expectedName += expectedNameSolidity.charAt(i)
		}

		assert.equal(expectedWeiDai, newWeiDai.address, "contract address mismatch")
		assert.equal(expectedDai, newDai.address, "contract address mismatch")
		assert.equal(expectedPRE, newPRE.address, "contract address mismatch")
		assert.equal(expectedWeiDaiBank, newBank.address, "contract address mismatch")
		assert.equal(expectedName, "kweidai", "family name mismatch")

		const expectedWeiDaiVersion = await vcInstance.getContractVersion.call(newWeiDai.address)
		assert.equal(expectedWeiDaiVersion, 100)
		const expectedDaiVersion = await vcInstance.getContractVersion.call(newDai.address)
		assert.equal(expectedDaiVersion, 100)
		const expectedPREVersion = await vcInstance.getContractVersion.call(newPRE.address)
		assert.equal(expectedPREVersion, 100)
		const expectedBankVersion = await vcInstance.getContractVersion.call(newBank.address)
		assert.equal(expectedBankVersion, 100)
	})

	test("setting to version 0 rejected", async () => {
		await expectThrow(vcInstance.setDefaultVersion(0, { from: accounts[0] }), "invalid version")
	})

	test("changing values for nonexistant version fails", async () => {
		const account = accounts[2]
		await expectThrow(vcInstance.setActiveVersion(13, { from: account }), "invalid version")
	})

	test("user with no version cannot access non-default contract family", async () => {
		const account = accounts[3]
		const newWeiDai = (await weidai.new())
		const newDai = (await mockdai.new())
		const newPRE = (await pre.new())
		const newBank = (await bank.new())

		await vcInstance.setContractGroup(5, newWeiDai.address,
			newDai.address,
			newPRE.address,
			newBank.address,
			web3.utils.fromAscii("weidai5"),
			true)

		await newDai.transfer(account, "10000", { from: accounts[0] })

		await expectThrow(newPRE.buyWeiDai("1000", "20", { from: account }), "version mismatch")
	})

	test("changing default contract family allows user with no active version to access different contract family", async () => {
		const account = accounts[6]
		const newWeiDai = (await weidai.new())
		const newDai = (await mockdai.new())
		const newPRE = (await pre.new())
		const newBank = (await bank.new())

		await vcInstance.setContractGroup(18, newWeiDai.address,
			newDai.address,
			newPRE.address,
			newBank.address,
			web3.utils.fromAscii("weidai5"),
			true)

		await newWeiDai.setVersionController(vcInstance.address)
		await newBank.setVersionController(vcInstance.address)
		await newPRE.setVersionController(vcInstance.address)

		await newDai.transfer(account, "10000", { from: accounts[0] })

		const currentUserActiveVersionBeforeChange = (await vcInstance.getUserActiveVersion(account)).toNumber()
		assert.equal(currentUserActiveVersionBeforeChange, 1)
		await vcInstance.setDefaultVersion(18)
		const currentUserActiveVersionAfterChange = (await vcInstance.getUserActiveVersion.call(account)).toNumber()
		assert.equal(currentUserActiveVersionAfterChange, 18)

		const contractVersion = (await vcInstance.getContractVersion.call(newPRE.address)).toNumber()
		assert.equal(contractVersion, 18)
		await newDai.approve(newBank.address, "10000", { from: account })
		await newPRE.buyWeiDai("1000", "20", { from: account })

		await expectThrow(preInstance.buyWeiDai("1000", "20", { from: account }), "version mismatch")
	})

	test("adding new contract family and setting user active version changes user's contract family usage", async () => {
		const account = accounts[6]
		const newWeiDai = (await weidai.new())
		const newDai = (await mockdai.new())
		const newPRE = (await pre.new())
		const newBank = (await bank.new())

		await vcInstance.setContractGroup(120, newWeiDai.address,
			newDai.address,
			newPRE.address,
			newBank.address,
			web3.utils.fromAscii("weidai120"),
			true)

		await newWeiDai.setVersionController(vcInstance.address)
		await newBank.setVersionController(vcInstance.address)
		await newPRE.setVersionController(vcInstance.address)

		await newDai.transfer(account, "10000", { from: accounts[0] })

		await vcInstance.setActiveVersion(120, { from: account })
		const activeVersion = (await vcInstance.getUserActiveVersion.call(account)).toNumber()
		assert.equal(activeVersion, 120)

		const contractVersion = (await vcInstance.getContractVersion.call(newPRE.address)).toNumber()
		assert.equal(contractVersion, 120)
		await newDai.approve(newBank.address, "10000", { from: account })
		await newPRE.buyWeiDai("1000", "20", { from: account })

		await daiInstance.approve(bankInstance.address, "10000", { from: account })
		await expectThrow(preInstance.buyWeiDai("1000", "20", { from: account }), "version mismatch")
	})

	test("disabling contract family prevents new weidai from being created", async () => {
		await vcInstance.setDefaultVersion(1, { from: accounts[0] })
		const account = accounts[8]
		await vcInstance.setEnabled(1, false, { from: accounts[0] })

		await daiInstance.approve(bankInstance.address, "10000", { from: account })
		await expectThrow(preInstance.buyWeiDai("1000", "20", { from: account }), "version disabled")

	})


	test("claim and redeem for active version", async () => {
		const primeAccount = accounts[0]
		const account = accounts[1]
		await vcInstance.setDefaultVersion(1, { from: primeAccount })
		await vcInstance.setEnabled(1, true, { from: primeAccount })
		await vcInstance.setActiveVersion(1, { from: primeAccount })

		const giftAccount = accounts[2]

		let currentClaimWaitWindow = (await preInstance.getClaimWaitWindow.call()).toNumber();
		await mockDaiInstance.approve(bank.address, "10000", { from: giftAccount })
		await preInstance.buyWeiDai("1000", "20", { from: giftAccount })

		let purchaseBlock = (await preInstance.getBlockOfPurchase({ from: giftAccount })).toNumber()

		for (let blockNumber = (await web3.eth.getBlockNumber()); blockNumber <= purchaseBlock + currentClaimWaitWindow; blockNumber = (await time.advanceBlock()));
		await preInstance.claimWeiDai({ from: giftAccount })

		const balanceOfGifter = (await weidaiInstance.balanceOf.call(giftAccount)).toNumber()
		await weidaiInstance.transfer(account, balanceOfGifter, { from: giftAccount })

		currentClaimWaitWindow = (await preInstance.getClaimWaitWindow.call()).toNumber();

		await mockDaiInstance.approve(bank.address, "10000", { from: account })
		await preInstance.buyWeiDai("1000", "20", { from: account })

		purchaseBlock = (await preInstance.getBlockOfPurchase({ from: account })).toNumber()

		for (let blockNumber = (await web3.eth.getBlockNumber()); blockNumber <= purchaseBlock + 3; blockNumber = (await time.advanceBlock()));
		await weidaiInstance.increaseAllowance(bankInstance.address, 1000000, { from: account })

		const daiBalanceBefore = (await mockDaiInstance.balanceOf.call(account)).toNumber()
		await vcInstance.claimAndRedeem(1, { from: account })

		const balanceAfter = (await weidaiInstance.balanceOf.call(account)).toNumber()
		const daiBalanceAfter = (await mockDaiInstance.balanceOf.call(account)).toNumber()
		assert.equal(balanceAfter, 0)
		assert.equal(daiBalanceAfter, daiBalanceBefore + 1758)
	})

	test("claim and redeem for inactive version", async () => {
		const primeAccount = accounts[0]
		const account = accounts[1]
		const giftAccount = accounts[2]

		const newWeiDai = (await weidai.new())
		const newDai = (await mockdai.new())
		const newPRE = (await pre.new())
		const newBank = (await bank.new())

		await vcInstance.setContractGroup(2, newWeiDai.address,
			newDai.address,
			newPRE.address,
			newBank.address,
			web3.utils.fromAscii("inactiveTest"),
			true)


		await vcInstance.setDefaultVersion(1, { from: primeAccount })
		await vcInstance.setEnabled(1, true, { from: primeAccount })
		await vcInstance.setActiveVersion(1, { from: primeAccount })
		await vcInstance.setActiveVersion(1, { from: account })
		await vcInstance.setActiveVersion(1, { from: giftAccount })


		let currentClaimWaitWindow = (await preInstance.getClaimWaitWindow.call()).toNumber();
		await mockDaiInstance.approve(bank.address, "10000", { from: giftAccount })
		await preInstance.buyWeiDai("1000", "20", { from: giftAccount })

		let purchaseBlock = (await preInstance.getBlockOfPurchase({ from: giftAccount })).toNumber()

		for (let blockNumber = (await web3.eth.getBlockNumber()); blockNumber <= purchaseBlock + currentClaimWaitWindow; blockNumber = (await time.advanceBlock()));
		await preInstance.claimWeiDai({ from: giftAccount })

		const balanceOfGifter = (await weidaiInstance.balanceOf.call(giftAccount)).toNumber()
		await weidaiInstance.transfer(account, balanceOfGifter, { from: giftAccount })

		currentClaimWaitWindow = (await preInstance.getClaimWaitWindow.call()).toNumber();

		await mockDaiInstance.approve(bank.address, "10000", { from: account })
		await preInstance.buyWeiDai("1000", "20", { from: account })

		purchaseBlock = (await preInstance.getBlockOfPurchase({ from: account })).toNumber()

		for (let blockNumber = (await web3.eth.getBlockNumber()); blockNumber <= purchaseBlock + 3; blockNumber = (await time.advanceBlock()));
		//await weidaiInstance.increaseAllowance(bankInstance.address, 1000000, { from: account })

		const daiBalanceBefore = (await mockDaiInstance.balanceOf.call(account)).toNumber()
		await vcInstance.setEnabled(1, false, { from: primeAccount })
		await vcInstance.setActiveVersion(2, { from: account })

		await vcInstance.claimAndRedeem(1, { from: account })
		await vcInstance.setEnabled(1, true, { from: primeAccount })
		await vcInstance.setActiveVersion(1, { from: account })

		const balanceAfter = (await weidaiInstance.balanceOf.call(account)).toNumber()
		const daiBalanceAfter = (await mockDaiInstance.balanceOf.call(account)).toNumber()
		assert.equal(balanceAfter, 0)
		assert.isAbove(daiBalanceAfter, daiBalanceBefore + 1700)
	})
})