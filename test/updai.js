
const async = require('./helpers/async.js')
const expectThrow = require('./helpers/expectThrow').handle
const test = async.test
const setup = async.setup
const updai = artifacts.require("Updai")

contract('Updai', accounts => {
	let updaiInstance
	setup(async () => {
		updaiInstance = await updai.deployed()
	})
	
	test("non bank can't issue", async () => {
		await updaiInstance.setBank(accounts[0], false);
		await expectThrow(updaiInstance.issue(accounts[1], "100", { from: accounts[0] }), 'unauthorized to issue new tokens')
	})

	test("bank can issue and burn but non-bank can't burn", async () => {
		await updaiInstance.setBank(accounts[0], true)
		await updaiInstance.issue(accounts[1], "100", { from: accounts[0] })
		await updaiInstance.burn(accounts[1], "50", { from: accounts[0] })
		await updaiInstance.setBank(accounts[0], false)
		await expectThrow(updaiInstance.burn(accounts[1], "50", { from: accounts[0] }), 'unauthorized to burn tokens')
	})

	test("bank can't burn more than totalSupply", async () => {
		await updaiInstance.setBank(accounts[0], true)
		let balanceOfAccount1 = parseInt((await updaiInstance.balanceOf.call(accounts[1])))
		let overflowAmount = `${balanceOfAccount1 + 1}`
		await expectThrow(updaiInstance.burn(accounts[1], overflowAmount, { from: accounts[0] }), "{}")//openzeppelin safemath seems to throw nothing in their require statements
	})

})