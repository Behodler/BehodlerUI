
const async = require('./helpers/async.js')
const expectThrow = require('./helpers/expectThrow').handle
const test = async.test
const setup = async.setup
const bank = artifacts.require("WeiDaiBank")
const pre = artifacts.require("PatienceRegulationEngine")


contract('bank', accounts => {
    let bankInstance, preInstance
    setup(async () => {
        bankInstance = await bank.deployed()
        preInstance = await pre.deployed()
    })

    test("non pre can't issue weidai through bank", async () => {
        let randomAddress = accounts[7]
        assert.notEqual(randomAddress, preInstance.address)
        await expectThrow(bankInstance.issue(accounts[0], "100", "200", { from: randomAddress }), 'only patience regulation engine can invoke this function')
    })

    test("only primary can trigger a donation withdrawal", async () => {
        let randomAddress = accounts[4]
        await expectThrow(bankInstance.withdrawDonations({ from: randomAddress }), 'satisfies all conditions set by Solidity `require` statements.')
    })
})
