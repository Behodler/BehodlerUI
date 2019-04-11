
const async = require('./helpers/async.js')
const expectThrow = require('./helpers/expectThrow').handle
const test = async.test
const setup = async.setup
const weidai = artifacts.require("WeiDai")
const bank = artifacts.require("WeiDaiBank")
contract('WeiDai', accounts => {
	let weidaiInstance, bankInstance
	setup(async () => {
		weidaiInstance = await weidai.deployed()
		bankInstance = await bank.deployed()
	})
	
	test("non bank can't issue", async () => {
		await expectThrow(weidaiInstance.issue(accounts[1], "100", { from: accounts[7] }), 'requires bank authorization')
	})

	test("non-bank can't burn", async () => {
		await expectThrow(weidaiInstance.burn(accounts[1], "50", { from: accounts[5] }), 'requires bank authorization')
	})

	test("bank can't burn more than totalSupply", async () => {
		let balanceOfAccount1 = parseInt((await weidaiInstance.balanceOf.call(accounts[1])))
		let overflowAmount = `${balanceOfAccount1 + 1}`
		await expectThrow(weidaiInstance.burn(accounts[1], overflowAmount, { from: bankInstance.address }), "{}")//openzeppelin safemath seems to throw nothing in their require statements
	})

})