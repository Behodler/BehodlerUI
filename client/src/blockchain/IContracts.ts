import { address, uint, Bytes32, int, uint16, uint8 } from './contractInterfaces/SolidityTypes'
import { Behodler } from './contractInterfaces/behodler/Behodler'
import { Chronos } from './contractInterfaces/behodler/Chronos'
import { Janus } from './contractInterfaces/behodler/Janus'
import { Kharon } from './contractInterfaces/behodler/Kharon'
import { Prometheus } from './contractInterfaces/behodler/Prometheus'
import { Scarcity } from './contractInterfaces/behodler/Scarcity'
import { Weth } from './contractInterfaces/behodler/Weth'
//hephaestus
import { Bellows } from './contractInterfaces/behodler/hephaestus/Bellows'
import { Lachesis } from './contractInterfaces/behodler/hephaestus/Lachesis'

//Behodler2
import { Behodler2 } from './contractInterfaces/behodler2/Behodler2'
import { Lachesis as Lachesis2 } from './contractInterfaces/behodler2/Lachesis'
import { LiquidityReceiver } from './contractInterfaces/behodler2/LiquidityReceiver'

//Morgoth
import Angband from './contractInterfaces/morgoth/Angband'
import IronCrown from './contractInterfaces/morgoth/IronCrown'
import Migrator from './contractInterfaces/morgoth/Migrator'
import { PowersRegistry } from './contractInterfaces/morgoth/Powers'
import ScarcityBridge from './contractInterfaces/morgoth/ScarcityBridge'
import { AddTokenToBehodler } from './contractInterfaces/morgoth/powerInvokers/AddTokenToBehodler'
import { ConfigureScarcity } from './contractInterfaces/morgoth/powerInvokers/ConfigureScarcity'
import { SetSilmaril } from './contractInterfaces/morgoth/powerInvokers/SetSilmaril'

export interface PowerInvokers {
	AddTokenToBehodler: AddTokenToBehodler
	ConfigureScarcity: ConfigureScarcity
	SetSilmaril: SetSilmaril
}

export interface Morgoth {
	Angband: Angband
	IronCrown: IronCrown
	Migrator: Migrator
	PowersRegistry: PowersRegistry
	ScarcityBridge: ScarcityBridge
	Invokers: PowerInvokers
}

export interface Behodler2Contracts {
	Behodler2: Behodler2,
	Morgoth: Morgoth,
	Lachesis: Lachesis2,
	LiquidityReceiver: LiquidityReceiver
	Weth10: Weth,
}

export interface BehodlerContracts {
	Behodler: Behodler,
	Behodler2: Behodler2Contracts,
	Chronos: Chronos,
	Janus: Janus,
	Kharon: Kharon,
	Prometheus: Prometheus,
	Scarcity: Scarcity,
	Weth: Weth,
	Bellows: Bellows,
	Lachesis: Lachesis,
}

export default interface IContracts {
	behodler: BehodlerContracts
}

const defaultBase = {
	address: "0x0"
}

const defaultSecondary = {
	primary: () => { },
	transferPrimary: (recipient: string) => { }
}

const defaultOwnable = {
	...defaultBase,
	owner: () => { },
	transferOwnership: (newOwner: address) => { }
}

const defaultERC20 = {
	totalSupply: () => { },
	balanceOf: (address: address) => { },
	allowance: (owner: address, spender: address) => { },
	transfer: (to: address, value: uint) => { },
	approve: (spender: address, value: uint) => { },
	transferFrom: (from: address, to: address, value: uint) => { },
	increaseAllowance: (spender: address, addedValue: uint) => { },
	decreaseAllowance: (spender: address, subtractedValue: uint) => { },
	decimals: () => { },
	symbol: () => { },
	name: () => { }
}

const defaultBehodler: Behodler = {
	...defaultBase,
	...defaultSecondary,
	seed: (lachesis: address, kharon: address, janus: address, chronos: address) => { },
	calculateAverageScarcityPerToken: (token: address, value: uint) => { },
	tokenScarcityObligations: (token: string) => { },
	buyDryRun: (tokenAddress: address, value: uint, minPrice: uint) => { },
	sellDryRun: (tokenAddress: address, scarcityValue: uint, maxPrice: uint) => { }
}

const defaultLachesis2: Lachesis2 = {
	...defaultOwnable,
	cut: (token: address) => { },
	measure: (token: address, valid: boolean, burnable: boolean) => { },
	measureLP: (token1: address, token2: address) => { }
}

const defaultLiquidityReceiver: LiquidityReceiver = {
	...defaultOwnable,
	registerPyroToken: (baseToken: address) => { },
	drain: (pyroToken: address) => { },
	baseTokenMapping: (pyrotoken: address) => { }
}

const defaultBehodler2Contract: Behodler2 = {
	...defaultOwnable,
	...defaultERC20,
	//SCARCITY PROPS
	migrator: () => { },
	configureScarcity: (transferFee: uint, burnFee: uint) => { },
	getConfiguration: () => { },
	setMigrator: (m: address) => { },
	burn: (value: uint) => { },

	//BEHODLER PROPS
	setSafetParameters: (swapPrecisionFactor: uint, maxLiquidityExit: uint) => { },
	tokenBurnable: (token: address) => { },
	validTokens: (token: address) => { },
	swap: (inputToken: address, outputToken: address, inputAmount: uint, outputAmount: uint) => { },
	addLiquidity: (inputToken: address, amount: uint) => { },
	withdrawLiquidity: (outputToken: address, tokensToRelease: uint) => { },
	grantFlashLoan: (amount: uint, flashLoanContract: address) => { },
	MIN_LIQUIDITY: () => { },
	withdrawLiquidityFindSCX: (outputToken: address, tokensToRelease: uint, scx: int, passes: uint) => { },
	getMaxLiquidityExit: () => { },
	setWhiteListUser: (user: address, whiteList: boolean) => { },
	whiteListUsers: (user: address) => { },
	Weth: () => { }
}

const defaultChronos: Chronos = {
	...defaultBase,
	...defaultSecondary,
	seed: (behodler: address) => { }
}

const defaultJanus: Janus = {
	...defaultBase,
	...defaultSecondary,
	seed: (scx: address, weth: address, behodler: address) => { },
	tokenToToken: (input: address, output: uint, value: uint, minPrice: uint, maxPrice: uint) => { },
	ethToToken: (output: address, minPrice: uint, maxPrice: uint) => { },
	tokenToEth: (input: address, value: uint, minPrice: uint, maxPrice: uint) => { },
	addLiquidityTokens: (token1: address, token2: address, v1: string, v2: string) => { },
	addLiquidityTokenAndEth: (token: address, v1: string) => { }
}

const defaultKharon: Kharon = {
	...defaultBase,
	...defaultSecondary,
	setTollRate: (toll: uint) => { },
	seed: (bellows: address, behodler: address, prometheus: address, weiDaiBank: address, dai: address, weidai: address, scar: address, cut: uint, donationAddress: address) => { },
	toll: (token: address, value: uint) => { },
	withdrawDonations: (token: address) => { },
	demandPaymentRewardDryRun: (token: address, value: uint) => { }
}

const defaultPrometheus: Prometheus = {
	...defaultBase,
	...defaultSecondary,
	seed: (kharon: address, scarcity: address, weidai: address, dai: address, registry: address) => { },
	stealFlame: (token: address, kharonToll: uint, buyer: address) => { },
}

const defaultScarcity: Scarcity = {
	...defaultSecondary,
	...defaultBase,
	...defaultERC20,
	setBehodler: (behodler: address) => { },
	burn: (value: uint) => { }
}

const defaultWeth: Weth = {
	...defaultBase,
	...defaultSecondary,
	...defaultERC20,
	deposit: () => { },
	withdraw: (value: uint) => { }
}

const defaultBellows: Bellows = {
	...defaultBase,
	...defaultSecondary,
	seed: (lachesisAddress: address, pyroTokenRegistry: address) => { },
	open: (baseToken: address, value: uint) => { },
	blast: (pyroToken: address, value: uint) => { },
	getLastAdjustmentBlockNumber: () => { },
	getRedeemRate: (pyroToken: address) => { }
}

const defaultLachesis: Lachesis = {
	...defaultSecondary,
	...defaultBase,
	setScarcity: (s: address) => { },
	measure: (token: address, valid: boolean) => { },
	cut: (token: address) => { }
}


const defaultPowerInvoker = {
	power: () => { },
	registry: () => { },
	angband: () => { },
	destruct: () => { },
	invoke: (minion: Bytes32, sender: address) => { }

}

const defaultAddTokenToBehodler: AddTokenToBehodler = {
	...defaultBase,
	...defaultPowerInvoker
}

const defaultConfigureScarcity: ConfigureScarcity = {
	...defaultBase,
	...defaultPowerInvoker,
	parameterize: (transferfee: uint, burnfee: uint, feeDestination: address) => { }
}

const defaultSetSilmaril: SetSilmaril = {
	...defaultBase,
	...defaultPowerInvoker,
	parameterize: (index: uint8, percentage: uint16, exit: address) => { }
}

const defaultPowerInvokers: PowerInvokers = {
	AddTokenToBehodler: defaultAddTokenToBehodler,
	ConfigureScarcity: defaultConfigureScarcity,
	SetSilmaril: defaultSetSilmaril
}

const defaultEmpowered = {
	...defaultOwnable,
	changePower: (registry: address) => { }
}

const defaultThangorodrium = {
	POWERREGISTRY: () => { },
	BEHODLER: () => { },
	LACHESIS: () => { },
	IRON_CROWN: () => { },
	ANGBAND: () => { },
	getAddress: (key: Bytes32) => { }
}

const defaultAngband: Angband = {
	...defaultEmpowered,
	...defaultThangorodrium,
	authorizedInvokers: (user: address) => { },
	ironCrown: () => { },
	finalizeSetup: () => { },
	authorizeInvoker: (invoker: address, authorized: boolean) => { },
	setPowersRegistry: (powers: address) => { },
	mapDomain: (location: address, domain: Bytes32) => { },
	relinquishDomain: (domain: Bytes32) => { },
	setBehodler: (behodler: address, lachesis: address) => { },
	executePower: (powerInvoker: address) => { },
	executeOrder66: () => { },
	withdrawSCX: (amount: uint) => { }
}

const defaultIronCrown: IronCrown = {
	...defaultEmpowered,
	setSCX: (scx: address) => { },
	settlePayments: () => { },
	setSilmaril: (index: uint8, percentage: uint16, exit: address) => { },
	getSilmaril: (index: uint8) => { }
}

const defaultMigrator: Migrator = {
	...defaultBase,
	stepCounter: () => { },
	bridge: () => { },
	initBridge: () => { },
	bail: () => { },
	step1: () => { },
	step2: (tokens: address[]) => { },
	step3: () => { },
	step4: (iterations: uint) => { },
	step5: () => { },
	step6: (iterations: uint) => { },
	step7: () => { }
}

const defaultPowersRegistry: PowersRegistry = {
	...defaultEmpowered,
	NULL: () => { },
	POINT_TO_BEHODLER: () => { },
	WIRE_ANGBAND: () => { },
	CHANGE_POWERS: () => { },
	CONFIGURE_THANGORODRIM: () => { },
	SEIZE_POWER: () => { },
	CREATE_NEW_POWER: () => { },
	BOND_USER_TO_MINION: () => { },
	ADD_TOKEN_TO_BEHODLER: () => { },
	CONFIGURE_SCARCITY: () => { },
	VETO_BAD_OUTCOME: () => { },
	DISPUTE_DECISION: () => { },
	SET_DISPUTE_TIMEOUT: () => { },
	INSERT_SILMARIL: () => { },
	AUTHORIZE_INVOKER: () => { },
	TREASURER: () => { },

	powers: (p: Bytes32) => { },
	userMinion: (user: address) => { },

	seed: () => { },
	userHasPower: (power: Bytes32, user: address) => { },
	isUserMinion: (user: address, minion: Bytes32) => { },
	create: (power: Bytes32, domain: Bytes32, transferrable: boolean, unique: boolean) => { },
	destroy: (power: Bytes32) => { },
	pour: (power: Bytes32, minion_to: Bytes32) => { },
	spread: (power: Bytes32, minion_to: Bytes32) => { },
	castIntoVoid: (user: address, minion: Bytes32) => { },
	bondUserToMinion: (user: address, minion: Bytes32) => { }
}

const defaultScarcityBridge: ScarcityBridge = {
	...defaultBase,
	exchangeRate: () => { },
	swap: () => { },
}

const defaultMorgoth: Morgoth = {
	Angband: defaultAngband,
	IronCrown: defaultIronCrown,
	Migrator: defaultMigrator,
	PowersRegistry: defaultPowersRegistry,
	ScarcityBridge: defaultScarcityBridge,
	Invokers: defaultPowerInvokers
}

const defaultBehodler2: Behodler2Contracts = {
	Behodler2: defaultBehodler2Contract,
	Lachesis: defaultLachesis2,
	Morgoth: defaultMorgoth,
	LiquidityReceiver: defaultLiquidityReceiver,
	Weth10: defaultWeth
}


export const DefaultBehodlerContracts: BehodlerContracts = {
	Behodler: defaultBehodler,
	Behodler2: defaultBehodler2,
	Chronos: defaultChronos,
	Janus: defaultJanus,
	Kharon: defaultKharon,
	Prometheus: defaultPrometheus,
	Scarcity: defaultScarcity,
	Weth: defaultWeth,
	Bellows: defaultBellows,
	Lachesis: defaultLachesis
}

export const DefaultContracts: IContracts = {
	behodler: DefaultBehodlerContracts
}