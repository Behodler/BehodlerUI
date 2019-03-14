
const async = require('./helpers/async.js')
const expectThrow = require('./helpers/expectThrow').handle
const test = async.test
const setup = async.setup
const bank = artifacts.require("WeiDaiBank")
const pre = artifacts.require("PatienceRegulationEngine")
const mockDai = artifacts.require("MockDai");

// some of the mechanics can only be tested live because we can't expect a unit test to wait a day and I will not callibrate contracts just to make unit tests quicker
//Famous last words ^^
contract('Patience Regulation Engine', accounts => {
    let bankInstance, preInstance, mockDaiInstance
    setup(async () => {
        bankInstance = await bank.deployed()
        preInstance = await pre.deployed()
        mockDaiInstance = await mockDai.deployed()
        for (var i = 0; i < accounts.length; i++)
            mockDaiInstance.transfer(accounts[i], "10000", { from: accounts[0] })
    })

    test("buying initial weidai for 2 accounts both get exchange rate of 1/1000.", async () => {
        const initialExchangeRate = (await bankInstance.getWeiDaiPerDai.call()).toString()
        assert.equal(initialExchangeRate, "1000")

    })

    test("prematurely withdrawing incurrs penalty, donates to donation address, strengthens exchange rate", async () => {

    })

    test("withdrawing after duration incurrs no penalty, exchange rate unaffected", async () => { // test will be long running

    })

    test("redeeming weidai from bank incurrs 2% fee, pushes up exchange rate, transfers dai from bank to withdrawer", async () => {

    })

    test("purchasing wei from multiple users doesn't affect last adjustment timestamp", async () => {

    })
})