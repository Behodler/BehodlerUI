
const async = require('./helpers/async.js')
const expectThrow = require('./helpers/expectThrow').handle
const test = async.test

const updai = artifacts.require("Updai")
const mockDai = artifacts.require("MockDai")
const generator = artifacts.require("Generator")

contract('Generator', accounts => {
	test("exchange rate is 100 when generator balance of dai is zero",async ()=>{

	})

	test ("can't send DAI to generator without first upping allowance", async ()=>{

	})

	test("issuing updai of 100 to user to user increases Vault by 0, totalSupply by 100", async ()=>{

	})

	test ("redeeming updai of 100, gets 90 updai worth of dai for redeemer and 1 to Vault", async () =>{
		//assert change in total supply of updai
		//assert change in exchange rate after redemption
	})

	test ("minting updai through sales doesn't change exchange rate, burning does", async ()=>{
		//generator.mint
		//updai.burn
	})
})