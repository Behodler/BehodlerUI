
const async = require('./helpers/async.js')
const expectThrow = require('./helpers/expectThrow').handle
const test = async.test
const setup = async.setup
const weidai = artifacts.require("WeiDai")

contract('WeiDai', accounts => {
	let weidaiInstance
	setup(async () => {
		weidaiInstance = await weidai.deployed()
	})
	
	test("non bank can't issue", async () => {
		await weidaiInstance.setBank(accounts[0], false);
		await expectThrow(weidaiInstance.issue(accounts[1], "100", { from: accounts[0] }), 'unauthorized to issue new tokens')
	})

	test("bank can issue and burn but non-bank can't burn", async () => {
		await weidaiInstance.setBank(accounts[0], true)
		await weidaiInstance.issue(accounts[1], "100", { from: accounts[0] })
		await weidaiInstance.burn(accounts[1], "50", { from: accounts[0] })
		await weidaiInstance.setBank(accounts[0], false)
		await expectThrow(weidaiInstance.burn(accounts[1], "50", { from: accounts[0] }), 'unauthorized to burn tokens')
	})

	test("bank can't burn more than totalSupply", async () => {
		await weidaiInstance.setBank(accounts[0], true)
		let balanceOfAccount1 = parseInt((await weidaiInstance.balanceOf.call(accounts[1])))
		let overflowAmount = `${balanceOfAccount1 + 1}`
		await expectThrow(weidaiInstance.burn(accounts[1], overflowAmount, { from: accounts[0] }), "- satisfies all conditions set by Solidity")//openzeppelin safemath seems to throw nothing in their require statements
	})

})