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
// import DaiAddressJSON from './daiNetworkAddresses.json'

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

interface userWeiDaiBalances {
	version:string
	incubating:string
	actual
}

class ethereumAPI {

	private metaMaskEnabled: boolean
	private versionBalances: userWeiDaiBalances
	private metaMaskConnected: boolean
	private contractsInitialized: boolean
	private currentAccount: address
	private accountSubscription: any
	private interval: any
	private web3: Web3;
	private versionArray: string[]
	public activeVersion: string
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

	public async populateVersionArray(options: any) {
		this.versionArray = []
		for (let versions: number = 1; ; versions++) {
			const versionString = "" + versions;
			const weiDaiAddress = await API.Contracts.VersionController.getWeiDai(versionString).call(options)
			if (weiDaiAddress === "0x0000000000000000000000000000000000000000") {
				break;
			}
			this.versionArray.push(versionString)
		}
		return this.versionArray;
	}

	private async configureVersionWarnings(){
		
	}

	private async initialize() {
		this.contractsInitialized = false
		if (!this.isMetaMaskConnected) {
			return;
		}

		const versionDeployment = await this.deploy(VERSIONJSON)
		const VersionController: WeiDaiVersionController = versionDeployment.methods
		VersionController.address = versionDeployment.address
		const options = { from: this.currentAccount };



		this.activeVersion = "" + this.hexToNumber(await VersionController.getUserActiveVersion(this.currentAccount).call(options))
		const weiDaiAddress = await VersionController.getWeiDai(this.activeVersion).call(options)
		const bankAddress = await VersionController.getWeiDaiBank(this.activeVersion).call(options)
		const preAddress = await VersionController.getPRE(this.activeVersion).call(options)
		const daiAddress = await VersionController.getDai(this.activeVersion).call(options)

		const weiDaiDeployment = await this.deploy(WDJSON, weiDaiAddress)
		const WeiDai: WeiDai = weiDaiDeployment.methods;
		WeiDai.address = weiDaiDeployment.address;

		const weiDaiBankDeployment = await this.deploy(bankJSON, bankAddress);
		const WeiDaiBank: WeiDaiBank = weiDaiBankDeployment.methods
		WeiDaiBank.address = weiDaiBankDeployment.address;

		const preDeployment = await this.deploy(PREJSON, preAddress)
		const PRE: PatienceRegulationEngine = preDeployment.methods
		PRE.address = preDeployment.address

		const Dai: ERC20 = ((await new this.web3.eth.Contract(ERC20JSON.abi as any, daiAddress)).methods as unknown) as ERC20
		Dai.address = daiAddress;

		this.Contracts = { WeiDai, WeiDaiBank, PRE, Dai, VersionController }
		await this.configureVersionWarnings()
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

	public toBytes(input: string) {
		return this.web3.utils.fromAscii(input)
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

	private async deploy(truffleJson: any, address?: string) {
		const abi = truffleJson.abi

		let keysOfNetworks = Object.keys(truffleJson.networks)
		const deployAddress: string = address || truffleJson.networks[keysOfNetworks[0]].address || ""
		try {
			const contractInstance = await new this.web3.eth.Contract(abi, deployAddress)

			return { methods: contractInstance.methods, address: deployAddress, contractInstance };
		}
		catch (err) {
			console.log("contract failed to load: " + err);
			return {
				address: "0x0",
				primary: () => new Promise<string>((resolve, reject) => { resolve("NULL"); })
			};
		}
	}
}

const API: ethereumAPI = new ethereumAPI()

export default API
