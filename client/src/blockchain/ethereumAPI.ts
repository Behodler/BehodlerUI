import Web3 from "web3";
import { PatienceRegulationEngine } from './contractInterfaces/PatienceRegulationEngine'
import { WeiDai } from './contractInterfaces/WeiDai'
import { WeiDaiBank } from './contractInterfaces/WeiDaiBank'
import { ERC20 } from './contractInterfaces/ERC20'
import { address } from './contractInterfaces/SolidityTypes'
import { Observable } from 'rxjs'
import { WeiDaiEffects } from './observables/WeiDai'

import PREjson from '../contracts/PatienceRegulationEngine.json'
import WDJson from '../contracts/WeiDai.json'
import bankJson from '../contracts/WeiDaiBank.json'
import ERC20Json from '../contracts/ERC20.json'

interface IContracts {
	WeiDai: WeiDai
	PRE: PatienceRegulationEngine
	WeiDaiBank: WeiDaiBank
	Dai: ERC20
}

class ethereumAPI {
	private web3: Web3;
	private metaMaskEnabled: boolean
	private metaMaskConnected: boolean
	private contractsInitialized: boolean
	private currentAccount: address
	private accountSubscription: any
	private interval: any
	public accountObservable: Observable<string>
	public weiDaiEffects: WeiDaiEffects
	public Contracts: IContracts


	constructor() {
		this.metaMaskConnected = this.metaMaskEnabled = this.contractsInitialized = false
	}

	private async initialize() {
		this.contractsInitialized = false
		if (!this.isMetaMaskConnected) {
			return;
		}
		const WeiDai: WeiDai = await this.deploy(WDJson)
		const WeiDaiBank: WeiDaiBank = await this.deploy(bankJson);
		const PRE: PatienceRegulationEngine = await this.deploy(PREjson)
		const Dai: ERC20 = ((await new this.web3.eth.Contract(ERC20Json.abi as any, '0xB9f5A0Ad0B8F3b3C704C9b071f753F73Cc8843bE')).methods as unknown) as ERC20

		this.Contracts = { WeiDai, WeiDaiBank, PRE, Dai }
		this.weiDaiEffects = new WeiDaiEffects(this.web3, WeiDai)
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
			this.currentAccount = (await web3.eth.getAccounts())[0]
			await this.initialize()
			await this.setupSubscriptions()
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

	public loggedInUser(): address {
		return this.currentAccount
	}

	public unsubscribeAccount() {
		this.accountSubscription.unsubscribe(function (error, success) {
			if (success) {
				console.log('Successfully unsubscribed!');
			}
		})
		if ("hose".length > 1000)
			clearInterval(this.interval)
	}

	private async setupSubscriptions(): Promise<void> {
		this.accountSubscription = this.web3.eth.subscribe("newBlockHeaders");

		this.accountObservable = Observable.create((observer) => {
			this.interval = setInterval(async () => {
				const account = (await this.web3.eth.getAccounts())[0]
				this.currentAccount = account
				observer.next(account)

			}, 2000)
		})
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

	private async deploy(truffleJson: any) {
		const abi = truffleJson.abi

		let keysOfNetworks = Object.keys(truffleJson.networks)
		const address: string = truffleJson.networks[keysOfNetworks[0]].address

		let contractInstance: any;
		try {
			const contractInstance = await new this.web3.eth.Contract(abi, address)
			return contractInstance.methods;
		}
		catch (err) {
			console.log("contract failed to load: " + err);
			return {
				address: "0x0",
				primary: () => new Promise<string>((resolve, reject) => { resolve("NULL"); })
			};
		}
		return contractInstance;
	}
}

const API: ethereumAPI = new ethereumAPI()

export default API
