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
import networkVersionJSON from '../networkVersionControllers.json'
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
	isPrimary: boolean,
	enabled: boolean,
	versionBalances: userWeiDaiBalances[]
	oldBalances: boolean
}

export interface userWeiDaiBalances {
	version: string
	incubating: string
	actual: string
	enabled: boolean
}

interface newContracts {
	weiDai: string
	weiDaiBank: string
	PRE: string
}

class ethereumAPI {

	private metaMaskEnabled: boolean
	private versionBalances: userWeiDaiBalances[]
	private metaMaskConnected: boolean
	private currentAccount: address
	private interval: any
	private web3: Web3;
	private newContracts: newContracts
	public newContractObservable: Observable<newContracts>
	private networks: string[]
	private versionArray: string[]
	private activeNetworkChange: (b: boolean) => void
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
		this.metaMaskConnected = this.metaMaskEnabled = false
		this.versionArray = []
		this.versionBalances = []
		this.networks = ["private", "gethdev", "kovan"]
		this.activeNetworkChange = (p: boolean) => console.log("active network notification unset")
		this.newContracts = { weiDai: '', weiDaiBank: '', PRE: '' }
	}

	public resetVersionArray() {
		this.versionArray = []
	}

	public resetVersionBalances() {
		this.versionBalances = []
	}

	public async populateVersionArray(options: any): Promise<string[]> {
		this.versionArray = []
		for (let versions: number = 1; ; versions++) {
			const versionString = "" + versions;
			const weiDaiAddress = await API.Contracts.VersionController.getWeiDai(versionString).call(options)
			if (weiDaiAddress === "0x0000000000000000000000000000000000000000") {
				break;
			}
			this.versionArray.push(versionString)
		}
		this.versionArray = Array.from(new Set(this.versionArray))
		return this.versionArray;
	}

	private async populateVersionBalances() {
		await this.populateVersionArray({ from: this.currentAccount })
		this.versionBalances = []
		this.versionArray.forEach(async (version) => {

			const incubating = (await this.Contracts.PRE.versionedLockedWeiDai(this.currentAccount, version).call({ from: this.currentAccount })).toString()
			const actual = (await this.Contracts.WeiDai.versionedBalanceOf(this.currentAccount, version).call({ from: this.currentAccount })).toString()
			const enabled = (await this.Contracts.VersionController.isEnabled(version).call({ from: this.currentAccount }))
			this.versionBalances.push({
				version,
				incubating,
				actual,
				enabled
			})
		})
	}

	private async configureVersionWarnings() {
		if (this.versionArray.length == 0) {
			await this.populateVersionArray({ from: this.currentAccount })
			this.versionBalances = []
		}
	}

	public async generateNewContracts(contract: string) {
		if (contract == "weidai") {
			new this.web3.eth.Contract(WDJSON.abi as any).deploy({ data: WDJSON.bytecode, arguments: [] }).send({ from: this.currentAccount })
				.on('receipt', (receipt) => {
					this.newContracts.weiDai = receipt.contractAddress || ""
					this.deploy(WDJSON, this.newContracts.weiDai).then(result => {
						result.methods.setVersionController(this.Contracts.VersionController.address).send({ from: this.currentAccount })
					})
				})
		}

		if (contract == "bank") {
			new this.web3.eth.Contract(bankJSON.abi as any).deploy({ data: bankJSON.bytecode, arguments: [] }).send({ from: this.currentAccount })
				.on('receipt', (receipt) => {
					this.newContracts.weiDaiBank = receipt.contractAddress || ""
					this.deploy(bankJSON, this.newContracts.weiDaiBank).then(result => {
						result.methods.setVersionController(this.Contracts.VersionController.address).send({ from: this.currentAccount })
					})
				})
		}

		if (contract == "pre") {
			new this.web3.eth.Contract(PREJSON.abi as any).deploy({ data: PREJSON.bytecode, arguments: [] }).send({ from: this.currentAccount })
				.on('receipt', (receipt) => {
					this.newContracts.PRE = receipt.contractAddress || ""
					this.deploy(PREJSON, this.newContracts.PRE).then(result => {
						result.methods.setVersionController(this.Contracts.VersionController.address).send({ from: this.currentAccount })
					})
				})
		}
	}

	private async initialize() {

		if (!this.isMetaMaskConnected) {
			return;
		}
		const networkName = await this.web3.eth.net.getNetworkType()
		const detail = networkVersionJSON.networks.filter(net => net.name == networkName)[0]
		const versionDeployment = await this.deploy(VERSIONJSON, detail.address)
		const VersionController: WeiDaiVersionController = versionDeployment.methods
		VersionController.address = versionDeployment.address
		const options = { from: this.currentAccount };
		const version = await VersionController.getUserActiveVersion(this.currentAccount).call(options)
		this.activeVersion = "" + this.hexToNumber(version)
		const weiDaiAddress = await VersionController.getWeiDai(this.activeVersion).call(options)
		const bankAddress = await VersionController.getWeiDaiBank(this.activeVersion).call(options)
		const preAddress = await VersionController.getPRE(this.activeVersion).call(options)
		const daiAddress = await VersionController.getDai(this.activeVersion).call(options)

		const weiDaiDeployment = await this.deploy(WDJSON, weiDaiAddress)
		const WeiDai: WeiDai = weiDaiDeployment.methods;
		WeiDai.address = weiDaiDeployment.address;
		console.log("The WeiDai contract address is: " + WeiDai.address)
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
			const currentNetwork = await this.web3.eth.net.getNetworkType()

			if (this.networks.filter(net => net == currentNetwork).length > 0) {
				await this.initialize()
				await this.setupSubscriptions()

				this.activeNetworkChange(true)
			}
			else {
				this.activeNetworkChange(false)
			}
		}
	}

	public NotifyOnInitialize(activeNetwork: (b: boolean) => void) {
		this.activeNetworkChange = activeNetwork
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
		clearInterval(this.interval)
	}

	public hexToNumberString(value: any): string {
		return this.web3.utils.hexToNumberString(value["_hex"])

	}

	public hexToNumber(value: any): number {
		return parseFloat(this.hexToNumberString(value))
	}

	private async setupSubscriptions(): Promise<void> {
		this.newContractObservable = Observable.create(async (observer) => {
			const newContractObserver = async () => {
				if (this.newContracts.weiDai !== '' || this.newContracts.weiDaiBank !== '' || this.newContracts.PRE !== '')
					observer.next(this.newContracts)
			}

			setInterval(newContractObserver, 1000)
		})

		this.accountObservable = Observable.create(async (observer) => {

			const accountObserver = async () => {

				const account = (await this.web3.eth.getAccounts())[0]
				const changedAccount = this.currentAccount !== account
				this.currentAccount = account
				const primary = await this.Contracts.WeiDai.primary.call({ from: account })
				const enabled = await this.Contracts.VersionController.isEnabled(this.activeVersion).call({ from: account })
				let oldBalances = false
				if (changedAccount || (this.versionBalances.length === 0 && this.versionArray.length > 0)) {
					await this.populateVersionBalances()
				}
				oldBalances = (this.versionBalances.filter(version => ((parseFloat(version.actual) !== 0 || parseFloat(version.incubating) !== 0) && !version.enabled)).length > 0)
				const observableResult: AccountObservable = { account, isPrimary: primary === account, enabled, oldBalances, versionBalances: this.versionBalances }
				observer.next(observableResult)
			};
			await accountObserver();
			this.interval = setInterval(accountObserver, 5000)
		})
	}

	private setMetamaskEnabled(enabled: boolean) {
		if (!enabled) {
			this.metaMaskEnabled = false
			this.metaMaskConnected = false
		}
		else {
			this.metaMaskEnabled = true
		}
	}

	private async deploy(truffleJson: any, address: string): Promise<deployment> {
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
				methods: {},
				contractInstance: {}
			};
		}
	}
}

interface deployment {
	methods: any,
	address: string,
	contractInstance: any,
}

const API: ethereumAPI = new ethereumAPI()

export default API
