
const async = require('./helpers/async.js')
const expectThrow = require('./helpers/expectThrow').handle
const test = async.test
const setup = async.setup

const updai = artifacts.require("Updai")
const hotPotato = artifacts.require("HotPotato")

contract("HotPotato", accounts => {
	let updaiInstance, hotPotatoInstance;
	const player1 = accounts[1];
	const player2 = accounts[2];
	const player3 = accounts[3];
	const player4 = accounts[4];
	
	setup(async () => {
		updaiInstance = await updai.deployed()
		hotPotatoInstance = await hotPotato.deployed()
		await updaiInstance.setBank(accounts[0], true);

		await updaiInstance.issue(player1, "1000000")
		await updaiInstance.issue(player2, "1000000")
		await updaiInstance.issue(player3, "1000000")
		await updaiInstance.issue(player4, "1000000")

		await hotPotatoInstance.setMiningProtection(2, 3)
		await hotPotatoInstance.setEpochDuration(10)

	})

	test("enter 1 player, increase last epoch settled, no winner", async () => {

	})

	test ("enter 2 players, increase last epoch settled, winner gets half of loser, dai total supply declines", async ()=>{
		//assert events
	})

	test("enter 3 players, hotpotato goes to player 1", async () => {
		//remember to assert refunds
	})

	test("enter 4 players but player 4 is too little", async ()=>{
		//remember to assert refunds and exchange rate change
	})

	test ("enter 4 players, player 4 is within cutoff, epoch is extended", async () =>{

	})

	test ("players enter 3 consecutive epochs (integration test)", async ()=>{

	})

})