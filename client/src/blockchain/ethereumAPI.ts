import Web3 from "web3";
import { PatienceRegulationEngine } from './contractInterfaces/PatienceRegulationEngine'
import { WeiDai } from './contractInterfaces/WeiDai'
import { WeiDaiBank } from './contractInterfaces/WeiDaiBank'


let TruffleContract = require("truffle-contract");
const patienceRegulationEngineContract = TruffleContract(require("../contracts/PatienceRegulationEngine.json"));
const weiDaiContract = TruffleContract(require("../contracts/WeiDai.json"));
const weiDaiBankContract = TruffleContract(require("../contracts/WeiDaiBank.json"));

interface IContracts {
	WeiDai: WeiDai
	PRE: PatienceRegulationEngine
	WeiDaiBank: WeiDaiBank
}

class ethereumAPI {
	private web3: Web3;
	private metaMaskEnabled: boolean
	private metaMaskConnected: boolean
	private contractsInitialized: boolean
	public Contracts: IContracts

	constructor() {
	}

	public async initialize() {
		this.contractsInitialized = false
		if (this.isMetaMaskEnabled) {
			console.log("metamask not enabled")
			return;
		}
		const WeiDai: WeiDai = await this.deploy(weiDaiContract);
		const WeiDaiBank: WeiDaiBank = await this.deploy(weiDaiBankContract);
		const PRE: PatienceRegulationEngine = await this.deploy(patienceRegulationEngineContract)
		this.Contracts = { WeiDai, WeiDaiBank, PRE }
		this.contractsInitialized = true
	}

	public async connectMetaMask() {
		let web3: Web3 = (window as any).web3 as Web3
		this.setMetamaskEnabled(false)
		if (typeof web3 !== 'undefined') {
			this.setMetamaskEnabled(true)
			try {
				await ((window as any).ethereum.enable())
				this.metaMaskConnected = true;
			} catch (metaMaskDeniedException) {
				this.metaMaskConnected = false
			}
			web3 = new Web3(web3.currentProvider)
			this.web3 = web3
		}else{
		}
	}

	public AreContractsInitialized(): boolean {
		return this.contractsInitialized
	}

	public isMetaMaskEnabled(): boolean {
		return this.metaMaskEnabled
	}

	public isMetaMaskConnected(): boolean {
		return this.metaMaskConnected
	}

	private setMetamaskEnabled(enabled: boolean) {
		if (!enabled) {
			this.contractsInitialized = false
			this.metaMaskEnabled = false
			this.metaMaskConnected = false
		}
		else {
			this.metaMaskEnabled = true
		}
	}

	private async deploy(contract: any) {
		contract.setProvider(this.web3.currentProvider);
		let contractInstance: any;
		try {
			contractInstance = await contract.deployed();
		} catch (err) {
			console.log("contract failed to load: " + err);
			return {
				address: "0x0",
				primary: () => new Promise<string>((resolve, reject) => { resolve("NULL"); })
			};
		}
		return contractInstance;
	}
}

const API:ethereumAPI = new ethereumAPI()

export default API
