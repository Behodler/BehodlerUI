import Web3 from "web3";
import IContracts, { BehodlerContracts, DefaultBehodlerContracts } from './IContracts'
import { PatienceRegulationEngine } from './contractInterfaces/PatienceRegulationEngine'
import { WeiDai } from './contractInterfaces/WeiDai'
import { WeiDaiBank } from './contractInterfaces/WeiDaiBank'
import { ERC20 } from './contractInterfaces/ERC20'
import { WeiDaiVersionController } from './contractInterfaces/WeiDaiVersionController'
import { PotReserve } from './contractInterfaces/PotReserve'

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
import potReserveJSON from '../contracts/PotReserve.json'
import networkVersionJSON from '../networkVersionControllers.json'

import BehodlerContractMappings from '../temp/BehodlerABIAddressMapping.json'

const potReserveAddresses =
{
	'private': '0x06f5D06d84b9aD11ef83C7C4491020Be4B274A4b',
	'kovan': '',
	'main': '0x64FB919a501E8c9Eecd8c541273Efe04CBCE79DA'
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

	private versionBalances: userWeiDaiBalances[]
	private versionArray: string[]

	private interval: any

	private newContracts: newContracts
	public initialized: boolean
	public newContractObservable: Observable<newContracts>
	private networkMapping: any
	public currentAccount: address
	public web3: Web3;
	public accountObservable: Observable<AccountObservable>
	public weiDaiEffects: ERC20Effects
	public daiEffects: ERC20Effects
	public preEffects: PatienceRegulationEffects
	public bankEffects: BankEffects
	public UINTMAX: string = "115792089237316000000000000000000000000000000000000000000000000000000000000000"
	public MAXETH: string = "115792089237316000000000000000000000000000000000000000000000"

	constructor() {
		this.versionArray = []
		this.versionBalances = []
		this.networkMapping = {
			'1': "main",
			'2': "morden",
			'3': "ropsten",
			'4': "rinkeby",
			'5': "goerli",
			'42': "kovan",
			"66": "private",
			"1337": "private"
		}
		this.newContracts = { weiDai: '', weiDaiBank: '', PRE: '' }
	}

	public resetVersionArray() {
		this.versionArray = []
	}

	public resetVersionBalances() {
		this.versionBalances = []
	}

	public async populateVersionArray(contracts: IContracts, options: any): Promise<string[]> {
		this.versionArray = []
		for (let versions: number = 1; ; versions++) {
			const versionString = "" + versions;
			const weiDaiAddress = await contracts.VersionController.getWeiDai(versionString).call(options)
			if (weiDaiAddress === "0x0000000000000000000000000000000000000000") {
				break;
			}
			this.versionArray.push(versionString)
		}
		this.versionArray = Array.from(new Set(this.versionArray))
		return this.versionArray;
	}

	public async populateVersionBalances(currentAccount: string, contracts: IContracts) {
		await this.populateVersionArray(contracts, { from: currentAccount })
		this.versionBalances = []
		this.versionArray.forEach(async (version) => {

			const incubating = (await contracts.PRE.versionedLockedWeiDai(currentAccount, version).call({ from: currentAccount })).toString()
			const actual = (await contracts.WeiDai.versionedBalanceOf(currentAccount, version).call({ from: currentAccount })).toString()
			const enabled = (await contracts.VersionController.isEnabled(version).call({ from: currentAccount }))
			this.versionBalances.push({
				version,
				incubating,
				actual,
				enabled
			})
		})
		return this.versionBalances;
	}

	private async configureVersionWarnings(contracts: IContracts, currentAccount: string) {
		if (this.versionArray.length == 0) {
			await this.populateVersionArray(contracts, { from: currentAccount })
			this.versionBalances = []
		}
	}

	public async generateNewContracts(contract: string, contracts: IContracts, currentAccount: string, existingAddress?: string) {
		if (contract == "weidai") {
			if (existingAddress) {
				this.newContracts.weiDai = existingAddress;
				return
			}
			new this.web3.eth.Contract(WDJSON.abi as any).deploy({ data: WDJSON.bytecode, arguments: [] }).send({ from: currentAccount })
				.on('receipt', (receipt) => {
					this.newContracts.weiDai = receipt.contractAddress || ""
					this.deploy(WDJSON, this.newContracts.weiDai).then(result => {
						result.methods.setVersionController(contracts.VersionController.address).send({ from: currentAccount })
					})
				})
		}

		if (contract == "bank") {
			if (existingAddress) {
				this.newContracts.weiDaiBank = existingAddress;
				return
			}
			new this.web3.eth.Contract(bankJSON.abi as any).deploy({ data: bankJSON.bytecode, arguments: [] }).send({ from: currentAccount })
				.on('receipt', (receipt) => {
					this.newContracts.weiDaiBank = receipt.contractAddress || ""
					this.deploy(bankJSON, this.newContracts.weiDaiBank).then(result => {
						result.methods.setVersionController(contracts.VersionController.address).send({ from: currentAccount })
					})
				})
		}

		if (contract == "pre") {
			if (existingAddress) {
				this.newContracts.PRE = existingAddress;
				return
			}
			new this.web3.eth.Contract(PREJSON.abi as any).deploy({ data: PREJSON.bytecode, arguments: [] }).send({ from: currentAccount })
				.on('receipt', (receipt) => {
					this.newContracts.PRE = receipt.contractAddress || ""
					this.deploy(PREJSON, this.newContracts.PRE).then(result => {
						result.methods.setVersionController(contracts.VersionController.address).send({ from: currentAccount })
					})
				})
		}
	}

	public async initialize(chainId, currentAccount: string): Promise<IContracts> {
		const networkName = this.networkMapping[chainId]
		const detail = networkVersionJSON.networks.filter(net => net.name == networkName)[0]
		const potReserveAddress = potReserveAddresses[networkName]
		const potReserveDeployment = await this.deploy(potReserveJSON, potReserveAddress)
		const PotReserve: PotReserve = potReserveDeployment.methods

		const versionDeployment = await this.deploy(VERSIONJSON, detail.address)
		const VersionController: WeiDaiVersionController = versionDeployment.methods
		VersionController.address = versionDeployment.address
		const options = { from: currentAccount };
		const version = await VersionController.getUserActiveVersion(currentAccount).call(options)
		var activeVersion = "" + this.hexToNumber(version)

		const weiDaiAddress = await VersionController.getWeiDai(activeVersion).call(options)
		const bankAddress = await VersionController.getWeiDaiBank(activeVersion).call(options)
		const preAddress = await VersionController.getPRE(activeVersion).call(options)
		const daiAddress = await VersionController.getDai(activeVersion).call(options)
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

		const behodlerContracts: BehodlerContracts = await this.fetchBehodlerDeployments(networkName)

		let contracts: IContracts = { WeiDai, WeiDaiBank, PRE, Dai, VersionController, PotReserve, activeVersion, behodler: behodlerContracts }
		await this.configureVersionWarnings(contracts, currentAccount)
		this.weiDaiEffects = new ERC20Effects(this.web3, contracts.WeiDai, currentAccount)
		this.daiEffects = new ERC20Effects(this.web3, contracts.Dai, currentAccount)
		this.preEffects = new PatienceRegulationEffects(this.web3, contracts.PRE, currentAccount)
		this.bankEffects = new BankEffects(this.web3, contracts.WeiDaiBank, currentAccount)
		this.initialized = true
		await this.setupSubscriptions()
		return contracts
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

	public pureHexToNumberString(value: any): string {
		return this.web3.utils.hexToNumberString(value)

	}

	public pureHexToNumber(value: any): number {
		return parseFloat(this.pureHexToNumberString(value))
	}

	private async setupSubscriptions(): Promise<void> {
		this.newContractObservable = Observable.create(async (observer) => {
			const newContractObserver = async () => {
				if (this.newContracts.weiDai !== '' || this.newContracts.weiDaiBank !== '' || this.newContracts.PRE !== '')
					observer.next(this.newContracts)
			}

			setInterval(newContractObserver, 1000)
		})
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

	private async deployBehodlerContract(abi: any, address: string): Promise<deployment> {
		try {
			const contractInstance = await new this.web3.eth.Contract(abi, address)

			return { methods: contractInstance.methods, address: address, contractInstance };
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

	private async fetchBehodlerDeployments(network: string): Promise<BehodlerContracts> {
		let behodlerContracts: BehodlerContracts = DefaultBehodlerContracts
		if (network == 'private')
			network = 'development'
		let mappingsList = BehodlerContractMappings.filter(item => item.name == network)[0].list
		const keys = Object.keys(behodlerContracts)
		keys.forEach(async (key) => {
			const alternateKey = key == 'Weth' ? 'MockWeth' : 'BADKEY'
			const currentMapping = mappingsList.filter(mapping => mapping.contract == key || mapping.contract == alternateKey)[0]
			const deployment = await this.deployBehodlerContract(currentMapping.abi, currentMapping.address)
			behodlerContracts[key] = deployment.methods
			behodlerContracts[key].address = deployment.address
		})
		return behodlerContracts
	}

}

interface deployment {
	methods: any,
	address: string,
	contractInstance: any,
}

const API: ethereumAPI = new ethereumAPI()

export default API
