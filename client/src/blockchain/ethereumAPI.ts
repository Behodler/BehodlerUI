import Web3 from "web3";
import IContracts, { BehodlerContracts, DefaultBehodlerContracts } from './IContracts'
import { ERC20 } from './contractInterfaces/ERC20'
import { PyroToken } from './contractInterfaces/behodler/hephaestus/PyroToken'

import { address } from './contractInterfaces/SolidityTypes'
import { Observable } from 'rxjs'
import { ERC20Effects } from './observables/ERC20'
import { EtherEffects } from './observables/Ether'
import Token from './observables/Token'
import { PatienceRegulationEffects } from './observables/PatienceRegulationEngine'
import { BankEffects } from './observables/WeiDaiBank'

import ERC20JSON from '../contracts/ERC20.json'

import { BellowsEffects } from './observables/Bellows'

import BehodlerContractMappings from '../temp/BehodlerABIAddressMapping.json'
import SisyphusContractMappings from '../temp/sisyphusAddress.json'
import Behodler2ContractMappings from '../blockchain/behodler2UI/Behodler.json'

import { Sisyphus as SisyphusContractInterface } from './contractInterfaces/behodler/Sisyphus/Sisyphus'
import { Faucet } from './contractInterfaces/behodler/Sisyphus/Faucet'

import { SisyphusContracts } from './IContracts'
import SisyphusABI from './behodlerUI/Sisyphus.json'
import FaucetABI from './behodlerUI/Faucet.json'
import BigNumber from 'bignumber.js';
import { SisyphusEffects } from './observables/Sisyphus';
import { ScarcityFaucetEffects } from './observables/ScarcityFaucet'

import CelebornJSON from './nimrodelUI/Celeborn.json'
import MiruvorJSON from './nimrodelUI/Miruvor.json'
import RivuletJSON from './nimrodelUI/Rivulet.json'
import nimrodelAddresses from './nimrodelUI/nimrodelAddresses.json'

import { NimrodelContracts } from './IContracts'
import { Celeborn } from './contractInterfaces/behodler/Nimrodel/Celeborn'
import { Miruvor } from './contractInterfaces/behodler/Nimrodel/Miruvor'
import { Rivulet } from './contractInterfaces/behodler/Nimrodel/Rivulet'

import { Behodler2Contracts } from './IContracts'
import { Behodler2 } from './contractInterfaces/behodler2/Behodler2'

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
	public bellowsEffects: BellowsEffects
	public sisyphusEffects: SisyphusEffects
	public scarcityEffects: ERC20Effects
	public scarcityFaucetEffects: ScarcityFaucetEffects
	public UINTMAX: string = "115792089237316000000000000000000000000000000000000000000000000000000000000000"
	public MAXETH: string = "115792089237316000000000000000000000000000000000000000000000"

	constructor() {
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

	public async initialize(chainId, currentAccount: string): Promise<IContracts> {
		const networkName = this.networkMapping[chainId]

		const behodlerContracts: BehodlerContracts = await this.fetchBehodlerDeployments(networkName)
		behodlerContracts.Sisyphus = await this.fetchSisyphus(networkName)
		behodlerContracts.Nimrodel = await this.fetchNimrodel(networkName)
		behodlerContracts.Behodler2 = await this.fetchBehodler2(networkName)
		let contracts: IContracts = { behodler: behodlerContracts }
		this.initialized = true
		this.bellowsEffects = new BellowsEffects(this.web3, contracts.behodler.Bellows, currentAccount)
		this.sisyphusEffects = new SisyphusEffects(this.web3, contracts.behodler.Sisyphus.Sisyphus, contracts.behodler.Scarcity, currentAccount)
		this.scarcityEffects = new ERC20Effects(this.web3, behodlerContracts.Scarcity, currentAccount)
		this.scarcityFaucetEffects = new ScarcityFaucetEffects(this.web3, behodlerContracts.Sisyphus.Faucet, currentAccount)
		await this.setupSubscriptions()
		return contracts
	}

	public toBytes(input: string) {
		return this.web3.utils.fromAscii(input)
	}

	public toWei(eth: string, override?: number) {
		const decimalPlaces = override || 18
		if (eth == 'unset')
			return 'unset'

		if (eth.indexOf('.') !== -1) {
			if (eth.length - eth.indexOf('.') > decimalPlaces)
				eth = eth.substring(0, eth.indexOf('.') + decimalPlaces)
		}
		if (!override)
			return this.web3.utils.toWei(eth)
		const factor = new BigNumber(10).pow(override)
		return new BigNumber(eth).times(factor).toString()
	}

	public fromWei(wei: string, override?: number) {
		if (wei == 'unset')
			return 'unset'
		if (!override)
			return this.web3.utils.fromWei(wei)
		const factor = new BigNumber(10).pow(override)
		return new BigNumber(wei).dividedBy(factor).toString()
	}

	public unsubscribeAccount() {
		clearInterval(this.interval)
	}

	public hexToNumberString(value: any): string {
		return this.web3.utils.hexToNumberString(value["_hex"])

	}

	public async enableToken(tokenAddress: string, owner: string, spender: string, callBack?: () => void): Promise<void> {
		const token: ERC20 = ((new this.web3.eth.Contract(ERC20JSON.abi as any, tokenAddress)).methods as unknown) as ERC20
		await token.approve(spender, this.UINTMAX).send({ from: owner }, () => {
			if (callBack) {
				callBack()
			}
		})
	}

	public async getPyroToken(tokenAddress: string, network: string): Promise<PyroToken> {
		network = network === 'private' || network === 'development' ? 'development' : network
		return await ((new this.web3.eth.Contract(this.getPyroTokenABI(network) as any, tokenAddress)).methods as unknown) as PyroToken
	}

	public generateNewEffects(tokenAddress: string, currentAccount: string, useEth: boolean, decimalPlaces: number = 18): Token {
		const token: ERC20 = ((new this.web3.eth.Contract(ERC20JSON.abi as any, tokenAddress)).methods as unknown) as ERC20
		if (useEth) {
			return new EtherEffects(this.web3, token, currentAccount)
		}

		return new ERC20Effects(this.web3, token, currentAccount, decimalPlaces)
	}

	public async getEthBalance(account: string): Promise<string> {

		return await this.web3.eth.getBalance(account)
	}

	public async getTokenBalance(tokenAddress: string, currentAccount: string, isEth: boolean, decimalPlaces: number): Promise<BigNumber> {
		if (isEth) {
			return new BigNumber(await this.web3.eth.getBalance(currentAccount))
		}
		const token: ERC20 = ((new this.web3.eth.Contract(ERC20JSON.abi as any, tokenAddress)).methods as unknown) as ERC20
		const balance = (await token.balanceOf(currentAccount).call({ from: currentAccount })).toString()
		return new BigNumber(balance)
	}

	public async getTokenAllowance(tokenAddress: string, currentAccount: string, isEth: boolean, decimalPlaces: number, behodlerAddress: string): Promise<BigNumber> {
		// if (isEth) {
		// 	return new BigNumber(await this.web3.eth.getBalance(currentAccount))
		// }
		const token: ERC20 = ((new this.web3.eth.Contract(ERC20JSON.abi as any, tokenAddress)).methods as unknown) as ERC20
		const allowance = await token.allowance(currentAccount, behodlerAddress).call({ from: currentAccount })

		return new BigNumber(allowance)
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

	private getPyroTokenABI(network: string): any {
		let mappingsList = BehodlerContractMappings.filter(item => item.name == network)[0].list
		return mappingsList.filter(m => m.contract === 'PyroToken')[0].abi
	}

	private async fetchBehodlerDeployments(network: string): Promise<BehodlerContracts> {
		let behodlerContracts: BehodlerContracts = DefaultBehodlerContracts
		network = network == 'private' ? 'development' : network

		let mappingsList = BehodlerContractMappings.filter(item => item.name == network)[0].list
		const keys = Object.keys(behodlerContracts).filter(key => key !== 'Sisyphus' && key !== 'Nimrodel' && key !== 'Behodler2')
		keys.forEach(async (key) => {
			const alternateKey = key == 'Weth' ? 'MockWeth' : 'BADKEY'
			const currentMapping = mappingsList.filter(mapping => mapping.contract == key || mapping.contract == alternateKey)[0]
			const deployment = await this.deployBehodlerContract(currentMapping.abi, currentMapping.address)
			behodlerContracts[key] = deployment.methods
			behodlerContracts[key].address = deployment.address
		})
		return behodlerContracts
	}

	private async fetchBehodler2(network: string): Promise<Behodler2Contracts> {
		let behodler2: Behodler2
		network = network == 'private' ? 'development' : network
		const networkKeys = Object.keys(Behodler2ContractMappings.networks)
		console.log(Behodler2ContractMappings.networks[networkKeys[0]])
		let address = Behodler2ContractMappings.networks[networkKeys[0]].address
		
		const deployment = await this.deployBehodlerContract(Behodler2ContractMappings.abi, address)
		behodler2 = deployment.methods
		behodler2.address = address
		return { Behodler2: behodler2 }

	}

	private async fetchSisyphus(network: string): Promise<SisyphusContracts> {
		let sisyphus: SisyphusContractInterface
		network = network == 'private' ? 'development' : network
		let address = SisyphusContractMappings.filter(s => s.network === network)[0].address
		const deployment = await this.deployBehodlerContract(SisyphusABI.abi, address)
		sisyphus = deployment.methods
		sisyphus.address = deployment.address
		let faucetAddress = await sisyphus.faucet().call()
		const faucetDeployment = await this.deployBehodlerContract(FaucetABI.abi, faucetAddress)
		let faucet: Faucet = faucetDeployment.methods
		faucet.address = faucetAddress
		return { Sisyphus: sisyphus, Faucet: faucet }
	}

	private async fetchNimrodel(network: string): Promise<NimrodelContracts> {
		network = network == 'private' ? 'development' : network
		let rivuletAddress = nimrodelAddresses[network]['Rivulet']
		let celebornAddress = nimrodelAddresses[network]['Celeborn']
		let miruvorAddress = nimrodelAddresses[network]['Miruvor']

		const rivuletDeployment = await this.deployBehodlerContract(RivuletJSON.abi, rivuletAddress)
		const celebornDeployment = await this.deployBehodlerContract(CelebornJSON.abi, celebornAddress)
		const miruvorDeployment = await this.deployBehodlerContract(MiruvorJSON.abi, miruvorAddress)

		let rivulet: Rivulet = rivuletDeployment.methods
		rivulet.address = rivuletDeployment.address

		let celeborn: Celeborn = celebornDeployment.methods
		celeborn.address = celebornDeployment.address

		let miruvor: Miruvor = miruvorDeployment.methods
		miruvor.address = miruvorDeployment.address

		return { Celeborn: celeborn, Miruvor: miruvor, Rivulet: rivulet }
	}

}

interface deployment {
	methods: any,
	address: string,
	contractInstance: any,
}

const API: ethereumAPI = new ethereumAPI()

export default API
