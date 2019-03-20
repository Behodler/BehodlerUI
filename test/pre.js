
const async = require('./helpers/async.js')
const expectThrow = require('./helpers/expectThrow').handle
const time = require('./helpers/time');

const test = async.test
const setup = async.setup
const bank = artifacts.require("WeiDaiBank")
const pre = artifacts.require("PatienceRegulationEngine")
const mockDai = artifacts.require("MockDai");

// some of the mechanics can only be tested live because we can't expect a unit test to wait a day and I will not callibrate contracts just to make unit tests quicker
//Famous last words ^^
const setupTests = async (accounts) => {
	var bi = await bank.deployed()
	var pi = await pre.deployed()
	var mi = await mockDai.deployed()
	for (var i = 0; i < accounts.length; i++)
		mi.transfer(accounts[i], "10000", { from: accounts[0] })
	return { bi, pi, mi };
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
		const initialExchangeRate = (await bankInstance.getWeiDaiPerDai.call()).toString()
		assert.equal(initialExchangeRate, "1000")

		await mockDaiInstance.approve(bank.address, "10000", { from: accounts[1] });
		expectThrow(preInstance.buyWeiDai("1000", "101", { from: accounts[1] }), "split is a % expressed as an integer between 0 and 100");
	})
});

contract('Patience Regulation Engine: BUY 1', accounts => {
	let bankInstance, preInstance, mockDaiInstance
	setup(async () => {
		const { bi, pi, mi } = await setupTests(accounts)
		bankInstance = bi
		preInstance = pi
		mockDaiInstance = mi
	})

	test("buying initial weidai for 2 accounts both get exchange rate of 1/1000.", async () => {
		const initialExchangeRate = (await bankInstance.getWeiDaiPerDai.call()).toString()
		assert.equal(initialExchangeRate, "1000")

		await mockDaiInstance.approve(bank.address, "10000", { from: accounts[1] });
		await preInstance.buyWeiDai("1000", "20", { from: accounts[1] });
		const firstBuyExchangeRate = (await bankInstance.getWeiDaiPerDai.call()).toString()
		assert.equal(firstBuyExchangeRate, "1000")

		await mockDaiInstance.approve(bank.address, "10000", { from: accounts[4] });
		await preInstance.buyWeiDai("1500", "0", { from: accounts[4] });
		const secondBuyExchangeRate = (await bankInstance.getWeiDaiPerDai.call()).toString()
		assert.equal(secondBuyExchangeRate, "1000")
	})
});


contract('Patience Regulation Engine: APPROVE', accounts => {
	let bankInstance, preInstance, mockDaiInstance
	setup(async () => {
		const { bi, pi, mi } = await setupTests(accounts)
		bankInstance = bi
		preInstance = pi
		mockDaiInstance = mi
	})

	test("not approving bank to take dai fails", async () => {
		const initialExchangeRate = (await bankInstance.getWeiDaiPerDai.call()).toString()
		assert.equal(initialExchangeRate, "1000")

		expectThrow(preInstance.buyWeiDai("1000", "20", { from: accounts[1] }), "{}");
	})
});


// contract('Patience Regulation Engine: Premature', accounts => {
// 	let bankInstance, preInstance, mockDaiInstance
// 	setup(async () => {
// 		const { bi, pi, mi } = await setupTests(accounts)
// 		bankInstance = bi
// 		preInstance = pi
// 		mockDaiInstance = mi
// 	})

// 	test("prematurely claiming incurs penalty, donates to donation address, strengthens exchange rate", async () => {
// 		// const initialExchangeRate = (await bankInstance.getWeiDaiPerDai.call()).toString()
// 		// assert.equal(initialExchangeRate, "1000")

// 		// await mockDaiInstance.approve(bank.address, "10000", { from: accounts[1] });
// 		// await preInstance.buyWeiDai("1000", "20", { from: accounts[1] });

// 	})
// })


// contract('Patience Regulation Engine: Patient', accounts => {
// 	let bankInstance, preInstance, mockDaiInstance
// 	setup(async () => {
// 		const { bi, pi, mi } = await setupTests(accounts)
// 		bankInstance = bi
// 		preInstance = pi
// 		mockDaiInstance = mi
// 	})

// 	test("withdrawing after duration incurs no penalty, exchange rate unaffected", async () => { // test will be long running. see https://medium.com/edgefund/time-travelling-truffle-tests-f581c1964687
// 	    // const secondsInFuture = time.oneDay;
//         // const originalBlock = web3.eth.getBlock('latest');
//         // const newBlock = await time.advanceTimeAndBlock(secondsInFuture);
//         // const timeDiff = newBlock.timestamp - originalBlock.timestamp;

// 		// assert.isTrue(timeDiff >= secondsInFuture);

// 	})
// })


// contract('Patience Regulation Engine: Redemption', accounts => {
// 	let bankInstance, preInstance, mockDaiInstance
// 	setup(async () => {
// 		const { bi, pi, mi } = await setupTests(accounts)
// 		bankInstance = bi
// 		preInstance = pi
// 		mockDaiInstance = mi
// 	})
// 	test("redeeming weidai from bank incurrs 2% fee, pushes up exchange rate, transfers dai from bank to withdrawer", async () => {

// 	})

// })

// contract('Patience Regulation Engine: Premature: TimeStamp stability', accounts => {
// 	let bankInstance, preInstance, mockDaiInstance
// 	setup(async () => {
// 		const { bi, pi, mi } = await setupTests(accounts)
// 		bankInstance = bi
// 		preInstance = pi
// 		mockDaiInstance = mi
// 	})
// 	test("purchasing wei from multiple users doesn't affect last adjustment timestamp", async () => {

// 	})

// })