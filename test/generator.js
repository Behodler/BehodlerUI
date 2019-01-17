
const async = require('./helpers/async.js')
const expectThrow = require('./helpers/expectThrow').handle
const test = async.test
const setup = async.setup

const updai = artifacts.require("Updai")
const mockDai = artifacts.require("MockDai")
const generator = artifacts.require("Generator")

contract('Generator', accounts => {
	let updaiInstance, mockDaiInstance, generatorInstance;
	setup(async () => {
		updaiInstance = await updai.deployed()
		mockDaiInstance = await mockDai.deployed()
		generatorInstance = await generator.deployed()
	})

	test("exchange rate is 100 when generator balance of dai is zero", async () => {
		const daiBalance = parseInt(await mockDaiInstance.balanceOf(generator.address))
		const totalUpdai = parseInt(await updaiInstance.totalSupply())
		const exchangeRate = parseInt(await generatorInstance.getExchangeRate.call())
		if (daiBalance === 0 || totalUpdai === 0) {
			assert.equal(exchangeRate, 100, "default exchange rate expected")
		} else {
			const expectedExchangeRate = (daiBalance * 100) / totalUpdai
			assert.equal(exchangeRate, expectedExchangeRate, "calculated exchange rate incorrect")
		}
	})

	test("can't send DAI to generator without first upping allowance", async () => {
		await expectThrow(generatorInstance.mintUpdai(1000), "Generator contract unauthorized to take Dai")
	})

	test("issuing updai of 100 to user to user increases Vault by 0, totalSupply by 100", async () => {
		const daiToSend = parseInt(await generatorInstance.getExchangeRate.call()) * 10

		await mockDaiInstance.approve(generatorInstance.address, daiToSend, { from: accounts[0] })
		await generatorInstance.mintUpdai(daiToSend, { from: accounts[0] })

		const updaiBalance = parseInt(await updaiInstance.balanceOf(accounts[0]))
		assert.equal(updaiBalance, daiToSend, "exchange rate should be 1 at this point")
		const vaultBalance = parseInt(await updaiInstance.balanceOf(accounts[2]))
		assert.equal(vaultBalance, 0, "nothing should be minted yet")
	})

	test("redeeming updai of 100, gets 90 updai worth of dai for redeemer and 1 to Vault", async () => {
		const daiBalanceBeforeRedemption = parseInt(await mockDaiInstance.balanceOf(accounts[0]))
		await updaiInstance.approve(generatorInstance.address, 100, { from: accounts[0] })
		await generatorInstance.redeemDai(100, { from: accounts[0] })
		const daiBalanceAfterRedemption = parseInt(await mockDaiInstance.balanceOf(accounts[0]))
		assert.equal(daiBalanceBeforeRedemption + 90, daiBalanceAfterRedemption)

		const vaultAddress = await generatorInstance.getVault.call();
		const vaultUpdaiBalance = parseInt(await updaiInstance.balanceOf(vaultAddress))

		assert.equal(vaultUpdaiBalance, 1)
	})

	test("minting updai through sales doesn't change exchange rate, burning does", async () => {
		const exchangeRate = parseInt(await generatorInstance.getExchangeRate.call())
		await mockDaiInstance.approve(generatorInstance.address, 200, { from: accounts[0] })
		await generatorInstance.mintUpdai(200, { from: accounts[0] })
		const exchangeRateAfterMint = parseInt(await generatorInstance.getExchangeRate.call())
		assert.equal(exchangeRate, exchangeRateAfterMint, "minting shouldn't alter exchange rate")

		const updaiToTradeIn = 200;
		await updaiInstance.approve(generatorInstance.address, updaiToTradeIn, { from: accounts[0] })
		await generatorInstance.redeemDai(updaiToTradeIn, { from: accounts[0] })

		const exchangeRateAfterRedemption = parseInt(await generatorInstance.getExchangeRate.call())
		assert.isAbove(exchangeRateAfterRedemption, exchangeRateAfterMint, "burning should increase exchange rate")
	})
})