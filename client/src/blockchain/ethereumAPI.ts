import Web3 from "web3";
import { PatienceRegulationEngine } from './contractInterfaces/PatienceRegulationEngine'
import { WeiDai } from './contractInterfaces/WeiDai'
import { WeiDaiBank } from './contractInterfaces/WeiDaiBank'
import { ERC20 } from './contractInterfaces/ERC20'
import { WeiDaiVersionController } from './contractInterfaces/WeiDaiVersionController'
import { address } from './contractInterfaces/SolidityTypes'
import { Observable } from 'rxjs'
import { ERC20Effects } from './observables/ERC20'
import { PatienceRegulationEffects } from './observables/PatienceRegulationEngine'
import { BankEffects } from './observables/WeiDaiBank'

import PREJSON from '../contracts/PatienceRegulationEngine.json'
import WDJSON from '../contracts/WeiDai.json'
import bankJSON from '../contracts/WeiDaiBank.json'
import ERC20JSON from '../contracts/ERC20.json'
import VERSIONJSON from '../contracts/WeiDaiVersionController.json'
import DaiAddressJSON from './daiNetworkAddresses.json'

interface IContracts {
	WeiDai: WeiDai
	PRE: PatienceRegulationEngine
	WeiDaiBank: WeiDaiBank
	Dai: ERC20
	VersionController: WeiDaiVersionController
}

interface AccountObservable {
	account: string
	isPrimary: boolean
}

class ethereumAPI {

	private metaMaskEnabled: boolean
	private metaMaskConnected: boolean
	private contractsInitialized: boolean
	private currentAccount: address
	private accountSubscription: any
	private interval: any
	private network: string
	private web3: Web3;
	public accountObservable: Observable<AccountObservable>
	public weiDaiEffects: ERC20Effects
	public daiEffects: ERC20Effects
	public preEffects: PatienceRegulationEffects
	public bankEffects: BankEffects
	public Contracts: IContracts
	public UINTMAX: string = "115792089237316000000000000000000000000000000000000000000000000000000000000000"
	public MAXETH: string = "115792089237316000000000000000000000000000000000000000000000"

	constructor() {
		this.metaMaskConnected = this.metaMaskEnabled = this.contractsInitialized = false
	}

	private async initialize() {
		this.contractsInitialized = false
		if (!this.isMetaMaskConnected) {
			return;
		}
		this.network = await this.web3.eth.net.getNetworkType();
		const weiDaiDeployment = await this.deploy(WDJSON)
		const WeiDai: WeiDai = weiDaiDeployment.methods;
		WeiDai.address = weiDaiDeployment.address;

		const weiDaiBankDeployment = await this.deploy(bankJSON);
		const WeiDaiBank: WeiDaiBank = weiDaiBankDeployment.methods
		WeiDaiBank.address = weiDaiBankDeployment.address;

		const preDeployment = await this.deploy(PREJSON)
		const PRE: PatienceRegulationEngine = preDeployment.methods
		PRE.address = preDeployment.address

		const versionDeployment = await this.deploy(VERSIONJSON)
		const VersionController: WeiDaiVersionController = versionDeployment.methods
		VersionController.address = versionDeployment.address

		const Dai: ERC20 = ((await new this.web3.eth.Contract(ERC20JSON.abi as any, DaiAddressJSON[this.network])).methods as unknown) as ERC20
		Dai.address = DaiAddressJSON[this.network]

		this.Contracts = { WeiDai, WeiDaiBank, PRE, Dai, VersionController }
		this.weiDaiEffects = new ERC20Effects(this.web3, this.Contracts.WeiDai)
		this.daiEffects = new ERC20Effects(this.web3, this.Contracts.Dai)
		this.preEffects = new PatienceRegulationEffects(this.web3, this.Contracts.PRE)
		this.bankEffects = new BankEffects(this.web3, this.Contracts.WeiDaiBank)
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
			await this.setupSubscriptions()
			await this.initialize()
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

	public toWei(eth: string) {
		if (eth == 'unset')
			return 'unset'
		return this.web3.utils.toWei(eth)
	}

	public fromWei(wei: string) {
		if (wei == 'unset')
			return 'unset'
		return this.web3.utils.fromWei(wei)
	}

	public unsubscribeAccount() {
		this.accountSubscription.unsubscribe(function (error, success) {
			if (success) {
				console.log('Successfully unsubscribed!');
			}
		})
		clearInterval(this.interval)
	}

	public hexToNumberString(value: any): string {
		return this.web3.utils.hexToNumberString(value["_hex"])
	}

	public hexToNumber(value: any): number {
		return parseFloat(this.hexToNumberString(value))
	}

	private async setupSubscriptions(): Promise<void> {
		this.accountSubscription = this.web3.eth.subscribe("newBlockHeaders");

		this.accountObservable = Observable.create(async (observer) => {
			const accountObserver = async () => {
				const account = (await this.web3.eth.getAccounts())[0]
				this.currentAccount = account
				const primary = await this.Contracts.WeiDai.primary.call({ from: account })
				const observableResult: AccountObservable = { account, isPrimary: primary === account }
				observer.next(observableResult)
			};
			await accountObserver();
			this.interval = setInterval(accountObserver, 2000)
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

			return { methods: contractInstance.methods, address };
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
