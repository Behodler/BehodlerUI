// import Web3 from "web3";
// import getWeb3 from "./getWeb3";


//SECTION: contract wrapper
// let TruffleContract = require("truffle-contract");
// const finrandContract = TruffleContract(require("../contracts/FinRand.json"));


//SECTION: ts interfaces from contracts. Think about how to work call into this
//have a wrapper contracts interface that is defined in same level as other interfaces
//Contracts.load(web3)

export default class ethereumAPI {
//	private web3:Web3;
	//private Contracts
	constructor(){
	}

	public async initialize(){
	//	this.web3 = await getWeb3();
	}

	public setFriendlyName(name:string) {

	}

	public async connectToMetamask(){
		
	}
}