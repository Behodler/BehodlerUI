import Web3 from "web3";
import IContracts, { BehodlerContracts, DefaultBehodlerContracts } from './IContracts'
import { ERC20 } from './contractInterfaces/ERC20'
import { Pyrotoken } from './contractInterfaces/behodler2/Pyrotoken'
import { Weth } from './contractInterfaces/behodler/Weth'

import { address } from './contractInterfaces/SolidityTypes'
import { Observable } from 'rxjs'
import { ERC20Effects } from './observables/ERC20'
import { EtherEffects } from './observables/Ether'
import Token from './observables/Token'
import { PatienceRegulationEffects } from './observables/PatienceRegulationEngine'
import { BankEffects } from './observables/WeiDaiBank'

import ERC20JSON from './behodlerUI/ERC20.json'
import { PyrotokenEffects } from './observables/PyrotokenEffects'

import BehodlerContractMappings from '../temp/BehodlerABIAddressMapping.json'
import Behodler2ContractMappings from '../blockchain/behodler2UI/Behodler.json'
import Lachesis2Json from '../blockchain/behodler2UI/Lachesis.json'
import LiquidityReceiverJson from '../blockchain/behodler2UI/LiquidityReceiver.json'

import BigNumber from 'bignumber.js';

import { Behodler2Contracts } from './IContracts'
import { Behodler2 } from './contractInterfaces/behodler2/Behodler2'
import { Morgoth } from './IContracts'
import Angband from './contractInterfaces/morgoth/Angband'
//,IronCrown,AddTokenToBehodler,Migrator,PowersRegistry:PowerRegistry,ScarcityBridge, Set
import IronCrown from './contractInterfaces/morgoth/IronCrown'
import { AddTokenToBehodler } from './contractInterfaces/morgoth/powerInvokers/AddTokenToBehodler'
import Migrator from './contractInterfaces/morgoth/Migrator'
import { PowersRegistry } from './contractInterfaces/morgoth/Powers'
import ScarcityBridge from './contractInterfaces/morgoth/ScarcityBridge'
import { SetSilmaril } from './contractInterfaces/morgoth/powerInvokers/SetSilmaril'
import { ConfigureScarcity } from './contractInterfaces/morgoth/powerInvokers/ConfigureScarcity'

import MorgothAddresses from './behodler2UI/Morgoth/Addresses.json'
import Behodler2Addresses from './behodler2UI/Addresses.json'
import AddTokenToBehodlerPower from './behodler2UI/Morgoth/AddTokenToBehodlerPower.json'
import AngbandJSON from './behodler2UI/Morgoth/Angband.json'
import ConfigureScarcityPowerJSON from './behodler2UI/Morgoth/ConfigureScarcityPower.json'
import IronCrownJSON from './behodler2UI/Morgoth/IronCrown.json'
import MigratorJSON from './behodler2UI/Morgoth/Migrator.json'
import PowersRegistryJSON from './behodler2UI/Morgoth/PowersRegistry.json'
import ScarcityBridgeJSON from './behodler2UI/Morgoth/ScarcityBridge.json'
import SetSilmarilJSON from './behodler2UI/Morgoth/SetSilmarilPower.json'
import { Lachesis as Lachesis2 } from "./contractInterfaces/behodler2/Lachesis";
import { LiquidityReceiver } from "./contractInterfaces/behodler2/LiquidityReceiver";
import { BridgeEffects } from './observables/BridgeEffects'
import { SluiceGateEffects } from './observables/SluiceGateEffects'
import { LiquidQueueEffects } from './observables/LiquidQueueEffects'
import Weth10JSON from './behodler2UI/WETH10.json'
import PyrotokenJSON from './behodler2UI/Pyrotoken.json'
import LiquidQueueJSON from "./liquidQueue/LiquidQueue.json"
import MintingModuleJSON from "./liquidQueue/MintingModule.json"
import RewardJSON from "./liquidQueue/Reward.json"
import SluiceGateJSON from "./liquidQueue/SluiceGate.json"
import UniswapV2FactoryJSON from './liquidQueue/UniswapV2Factory.json'
import UniswapV2PairJSON from './liquidQueue/UniswapV2Pair.json'

import { LiquidQueue as LQ } from './contractInterfaces/liquidQueue/LiquidQueue'
import { MintingModule } from './contractInterfaces/liquidQueue/MintingModule'
import { Reward } from './contractInterfaces/liquidQueue/Reward'
import { SluiceGate } from './contractInterfaces/liquidQueue/SluiceGate'
import { LiquidQueue } from './IContracts'

import LiquidQueueAddresses from './liquidQueue/Addresses.json'
import UniswapV2Factory from "./contractInterfaces/liquidQueue/UniswapV2Factory";
import { UniswapV2Effects } from "./observables/UniswapEffects";
import UniswapV2Pair from "./contractInterfaces/liquidQueue/UniswapV2Pair";



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

interface LQInputAddressList {
	Dai: string,
	Eth: string,
	Scarcity: string,
	Eye: string
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
	public scarcityEffects: ERC20Effects
	public bridgeEffects: BridgeEffects
	public sluiceGateEffects: SluiceGateEffects
	public liquidQueueEffects: LiquidQueueEffects
	public eyeWethLPEffects: UniswapV2Effects
	public scxEyeLPEffects: UniswapV2Effects
	public UINTMAX: string = "115792089237316000000000000000000000000000000000000000000000000000000000000000"
	public MAXETH: string = "115792089237316000000000000000000000000000000000000000000000"
	public ONE = BigInt("1000000000000000000")
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
		behodlerContracts.Behodler2 = await this.fetchBehodler2(networkName)
		let contracts: IContracts = { behodler: behodlerContracts }
		this.initialized = true
		this.scarcityEffects = new ERC20Effects(this.web3, behodlerContracts.Scarcity, currentAccount)
		this.bridgeEffects = new BridgeEffects(this.web3, behodlerContracts.Behodler2.Morgoth.ScarcityBridge, currentAccount)



		this.sluiceGateEffects = new SluiceGateEffects(this.web3, behodlerContracts.Behodler2.LiquidQueue.SluiceGate, currentAccount)
		const networkNameForQueue = networkName == 'private' ? 'development' : networkName

		const ethEyePairAddress = await behodlerContracts.Behodler2.LiquidQueue.UniswapV2Factory.getPair(LiquidQueueAddresses[networkNameForQueue].EYE, LiquidQueueAddresses[networkNameForQueue].WETH).call()
		const ethEyePairDeployment = await this.deployBehodlerContract(UniswapV2PairJSON.abi, ethEyePairAddress)
		const ethEyePair: UniswapV2Pair = ethEyePairDeployment.methods
		ethEyePair.address = ethEyePairAddress;
		const eyeDeployment = await this.deployBehodlerContract(ERC20JSON.abi, LiquidQueueAddresses[networkNameForQueue].EYE)
		const eye: ERC20 = eyeDeployment.methods
		eye.address = LiquidQueueAddresses[networkNameForQueue].EYE
		this.eyeWethLPEffects = new UniswapV2Effects(this.web3, ethEyePair, eye, currentAccount, this.ONE.toString())

		//this next line is mostly for the sake of dependency free debugging
		const scxDeployment = await this.deployBehodlerContract(Behodler2ContractMappings.abi, LiquidQueueAddresses[networkNameForQueue].SCX)
		const scx: Behodler2 = scxDeployment.methods
		scx.address = scxDeployment.address

		this.liquidQueueEffects = new LiquidQueueEffects(this.web3,
			behodlerContracts.Behodler2.LiquidQueue.LiquidQueue,
			behodlerContracts.Behodler2.LiquidQueue.MintingModule,
			behodlerContracts.Behodler2.LiquidQueue.Reward.address,
			currentAccount,
			eye,
			scx,
			behodlerContracts.Behodler2.LiquidQueue.UniswapV2Factory)

		const scxEyePairAddress = await behodlerContracts.Behodler2.LiquidQueue.UniswapV2Factory.getPair(LiquidQueueAddresses[networkNameForQueue].EYE, LiquidQueueAddresses[networkNameForQueue].SCX).call()
		const scxEyePairDeployment = await this.deployBehodlerContract(UniswapV2PairJSON.abi, scxEyePairAddress)
		const scxEyePair: UniswapV2Pair = scxEyePairDeployment.methods
		scxEyePair.address = scxEyePairAddress
		this.scxEyeLPEffects = new UniswapV2Effects(this.web3, scxEyePair, eye, currentAccount, this.ONE.toString())
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
		try {
			BigNumber.config({ DECIMAL_PLACES: 20 })
			if (wei == 'unset')
				return 'unset'
			if (!override)
				return this.web3.utils.fromWei(wei)
			const bigWei = new BigNumber(wei)
			const factor = new BigNumber(10).pow(override)
			return bigWei.div(factor).toString()
		} catch
		{
			return '0'
		}
	}

	public unsubscribeAccount() {
		clearInterval(this.interval)
	}

	public hexToNumberString(value: any): string {
		return this.web3.utils.hexToNumberString(value["_hex"])

	}

	public async enableToken(tokenAddress: string, owner: string, spender: string, callBack?: () => void): Promise<void> {
		const token: ERC20 = ((new this.web3.eth.Contract(ERC20JSON.abi as any, tokenAddress)).methods as unknown) as ERC20
		await token.approve(spender, API.UINTMAX).send({ from: owner }, () => {
			if (callBack) {
				callBack()
			}
		})
	}

	public isEth(token: string, network: string): boolean {
		const networkNameForQueue = network === 'private' || network === 'development' ? 'development' : network
		return LiquidQueueAddresses[networkNameForQueue].WETH === token
	}
	public async getToken(tokenAddress: string, network: string): Promise<ERC20> {
		network = network === 'private' || network === 'development' ? 'development' : network
		var token = (((new this.web3.eth.Contract(ERC20JSON.abi as any, tokenAddress)).methods as unknown) as ERC20)
		token.address = tokenAddress;
		return token
	}

	public getEYEAddress(network: string): string {
		const netName = network === 'private' ? 'development' : network
		const EYE = LiquidQueueAddresses[netName].EYE
		return EYE
	}

	public async getPyroToken(tokenAddress: string, network: string): Promise<Pyrotoken> {
		network = network === 'private' || network === 'development' ? 'development' : network
		return await (((new this.web3.eth.Contract(PyrotokenJSON.abi as any, tokenAddress)).methods as unknown) as Pyrotoken)
	}

	public generateNewEffects(tokenAddress: string, currentAccount: string, useEth: boolean, decimalPlaces: number = 18): Token {
		const token: ERC20 = ((new this.web3.eth.Contract(ERC20JSON.abi as any, tokenAddress)).methods as unknown) as ERC20
		if (useEth) {
			return new EtherEffects(this.web3, token, currentAccount)
		}

		return new ERC20Effects(this.web3, token, currentAccount, decimalPlaces)
	}

	public async getPyroTokenEffects(pyroTokenAddress: string, network: string, account: string): Promise<PyrotokenEffects> {
		const pyroTokenInstance = await this.getPyroToken(pyroTokenAddress, network)
		return new PyrotokenEffects(this.web3, pyroTokenInstance, account)
	}

	public async EYE_ETH_PAIR(network: address, account: string): Promise<string> {
		const netName = network === 'private' ? 'development' : network
		const EYE = LiquidQueueAddresses[netName].EYE
		const WETH = LiquidQueueAddresses[netName].WETH
		const factoryInstance: UniswapV2Factory = (await this.deployBehodlerContract(UniswapV2FactoryJSON.abi, LiquidQueueAddresses[netName].UniswapV2Factory)).methods
		return await factoryInstance.getPair(EYE, WETH).call({ from: account })
	}

	public async EYE_SCX_PAIR(network: address, account: string): Promise<string> {
		const netName = network === 'private' ? 'development' : network
		const EYE = LiquidQueueAddresses[netName].EYE
		const SCX = LiquidQueueAddresses[netName].SCX
		const factoryInstance: UniswapV2Factory = (await this.deployBehodlerContract(UniswapV2FactoryJSON.abi, LiquidQueueAddresses[netName].UniswapV2Factory)).methods
		return await factoryInstance.getPair(EYE, SCX).call({ from: account })
	}
	public async EYE_ETHEffects(network: address, account: string): Promise<Token> {
		const pair = await this.EYE_ETH_PAIR(network, account)
		return this.generateNewEffects(pair, account, false)
	}

	public async EYE_SCXEffects(network: address, account: string): Promise<Token> {
		const pair = await this.EYE_SCX_PAIR(network, account)
		return this.generateNewEffects(pair, account, false)
	}

	public getLQInputAddresses(network: string): LQInputAddressList {
		const netName = network === 'private' ? 'development' : network

		return {
			Dai: LiquidQueueAddresses[netName].DAI,
			Eth: LiquidQueueAddresses[netName].WETH,
			Scarcity: LiquidQueueAddresses[netName].SCX,
			Eye: LiquidQueueAddresses[netName].EYE
		}
	}

	public async getEthBalance(account: string): Promise<string> {

		return await this.web3.eth.getBalance(account)
	}

	public constructRewardToken(tokenAddress: string, network: string) {
		const netName = network === 'private' ? 'development' : network
		switch (tokenAddress) {
			case LiquidQueueAddresses[netName].DAI:
				return 'EYE/DAI'
			case LiquidQueueAddresses[netName].WETH:
				return 'SCX/WETH'
			case LiquidQueueAddresses[netName].SCX:
				return 'SCX/EYE'
			case LiquidQueueAddresses[netName].EYE:
				return 'SCX/EYE'
			default: return 'not found'
		}
	}

	public async getTokenBalance(tokenAddress: string, currentAccount: string, isEth: boolean, decimalPlaces: number): Promise<string> {
		if (isEth) {
			return (await this.web3.eth.getBalance(currentAccount)).toString()
		}
		const token: ERC20 = ((new this.web3.eth.Contract(ERC20JSON.abi as any, tokenAddress)).methods as unknown) as ERC20
		const balance = (await token.balanceOf(currentAccount).call({ from: currentAccount })).toString()
		return balance
	}

	public async getTokenSymbol(tokenAddress: string): Promise<string> {

		const token: ERC20 = await ((new this.web3.eth.Contract(PyrotokenJSON.abi as any, tokenAddress)).methods as unknown) as ERC20
		return (await token.symbol().call())
	}

	public async getTokenDecimals(tokenAddress: string): Promise<number> {
		const token: ERC20 = ((new this.web3.eth.Contract(ERC20JSON.abi as any, tokenAddress)).methods as unknown) as ERC20
		try {
			return parseInt((await token.decimals().call()).toString())

		} catch
		{
			return 18
		}
	}

	public async getTokenTotalSupply(tokenAddress: string): Promise<string> {
		const token: ERC20 = ((new this.web3.eth.Contract(ERC20JSON.abi as any, tokenAddress)).methods as unknown) as ERC20
		try {
			return (await token.totalSupply().call()).toString()

		} catch
		{
			return "0"
		}
	}

	public async getTokenAllowance(tokenAddress: string, currentAccount: string, isEth: boolean, decimalPlaces: number, behodlerAddress: string): Promise<BigNumber> {
		BigNumber.set({ POW_PRECISION: 100 })
		BigNumber.config({ EXPONENTIAL_AT: 100 })
		const token: ERC20 = ((new this.web3.eth.Contract(ERC20JSON.abi as any, tokenAddress)).methods as unknown) as ERC20
		const allowance = await token.allowance(currentAccount, behodlerAddress).call({ from: currentAccount })

		return new BigNumber(allowance)
	}
	public hexToNumber(value: any): number {
		return parseFloat(this.hexToNumberString(value))
	}

	public pureHexToNumberString(value: any): string {
		if (value === "0")
			return "0"
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
		const addresses = Behodler2Addresses[network]


		const deployment = await this.deployBehodlerContract(Behodler2ContractMappings.abi, addresses.behodler)
		behodler2 = deployment.methods
		behodler2.address = addresses.behodler

		const wethAddress = await behodler2.Weth().call()
		const wethDeployment = await this.deployBehodlerContract(Weth10JSON.abi, wethAddress)
		const Weth10: Weth = wethDeployment.methods
		Weth10.address = wethAddress

		const lachesisDeployment = await this.deployBehodlerContract(Lachesis2Json.abi, addresses.lachesis)
		let lachesis: Lachesis2 = lachesisDeployment.methods
		lachesis.address = addresses.liquidityReceiver

		const liquidityDeployment = await this.deployBehodlerContract(LiquidityReceiverJson.abi, addresses.liquidityReceiver)
		let liquidityReceiver: LiquidityReceiver = liquidityDeployment.methods
		liquidityReceiver.address = addresses.liquidityReceiver

		const morgoth = await this.fetchMorgoth(network)

		const liquidQueue = await this.fetchLiquidQueue(network)
		return { Behodler2: behodler2, Morgoth: morgoth, Lachesis: lachesis, LiquidityReceiver: liquidityReceiver, Weth10, LiquidQueue: liquidQueue }
	}

	private async fetchLiquidQueue(network: string): Promise<LiquidQueue> {
		network = network == 'private' ? 'development' : network
		const addresses = LiquidQueueAddresses[network]
		const lqDeployment = await this.deployBehodlerContract(LiquidQueueJSON.abi, addresses.LiquidQueue)
		let lq: LQ = lqDeployment.methods
		lq.address = lqDeployment.address

		const mintingModuleDeployment = await this.deployBehodlerContract(MintingModuleJSON.abi, addresses.MintingModule)
		let mm: MintingModule = mintingModuleDeployment.methods
		mm.address = mintingModuleDeployment.address

		const rewardDeployment = await this.deployBehodlerContract(RewardJSON.abi, addresses.Reward)
		let reward: Reward = rewardDeployment.methods
		reward.address = rewardDeployment.address

		const factoryDeployment = await this.deployBehodlerContract(UniswapV2FactoryJSON.abi, addresses.UniswapV2Factory)
		let factory: UniswapV2Factory = factoryDeployment.methods
		factory.address = factoryDeployment.address

		const sluiceGateDeployment = await this.deployBehodlerContract(SluiceGateJSON.abi, addresses.SluiceGate)
		let sluiceGate: SluiceGate = sluiceGateDeployment.methods
		sluiceGate.address = sluiceGateDeployment.address
		return {
			LiquidQueue: lq,
			MintingModule: mm,
			Reward: reward,
			SluiceGate: sluiceGate,
			UniswapV2Factory: factory
		}
	}

	private async fetchMorgoth(network: string): Promise<Morgoth> {
		const addresses = MorgothAddresses[network]
		const angbandDeployment = await this.deployBehodlerContract(AngbandJSON.abi, addresses.Angband)
		const Angband: Angband = angbandDeployment.methods
		Angband.address = angbandDeployment.address

		const configureScarcityDeployment = await this.deployBehodlerContract(ConfigureScarcityPowerJSON.abi, addresses.ConfigureScarcity)
		const ConfigureScarcity: ConfigureScarcity = configureScarcityDeployment.methods
		ConfigureScarcity.address = configureScarcityDeployment.address

		const ironCrownDeployment = await this.deployBehodlerContract(IronCrownJSON.abi, addresses.IronCrown)
		const IronCrown: IronCrown = ironCrownDeployment.methods
		IronCrown.address = ironCrownDeployment.address

		let { methods, address } = await this.deployBehodlerContract(AddTokenToBehodlerPower.abi, addresses.AddTokenToBehodler)
		const AddTokenToBehodler: AddTokenToBehodler = methods
		AddTokenToBehodler.address = address

		let migratorDeployment = await this.deployBehodlerContract(MigratorJSON.abi, addresses.Migrator)
		const Migrator: Migrator = migratorDeployment.methods
		Migrator.address = migratorDeployment.address

		let registryDeployement = await this.deployBehodlerContract(PowersRegistryJSON.abi, addresses.PowersRegistry)
		const PowersRegistry: PowersRegistry = registryDeployement.methods
		PowersRegistry.address = registryDeployement.address

		let scarcityBridgeDeployment = await this.deployBehodlerContract(ScarcityBridgeJSON.abi, addresses.ScarcityBridge)
		const ScarcityBridge: ScarcityBridge = scarcityBridgeDeployment.methods
		ScarcityBridge.address = scarcityBridgeDeployment.address

		let setSilamrilDeployment = await this.deployBehodlerContract(SetSilmarilJSON.abi, addresses.SetSilmaril)
		const SetSilmaril: SetSilmaril = setSilamrilDeployment.methods
		SetSilmaril.address = setSilamrilDeployment.address
		const Invokers = { ConfigureScarcity, AddTokenToBehodler, SetSilmaril }
		return { Angband, Invokers, IronCrown, Migrator, PowersRegistry, ScarcityBridge }
	}
}

interface deployment {
	methods: any,
	address: string,
	contractInstance: any,
}

const API: ethereumAPI = new ethereumAPI()

export default API
