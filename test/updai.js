
let async = require('./helpers/async.js')
let expectThrow = require("./helpers/expectThrow").handle
let test = async.test

const updai = artifacts.require("Updai")

contract('Updai',accounts=>{
	
	//TODO: create mock dai 
	test("non bank can't issue", async ()=>{
		let updaiInstance = await updai.deployed()
		
	})

	test ("bank can issue, non bank can't burn",async ()=>{

	})

	test ("bank can't burn more than totalSupply", async ()=>{

	})

})