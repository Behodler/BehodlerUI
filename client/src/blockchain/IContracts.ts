import { address, uint, Bytes, Bytes32, int, uint16, uint8 } from './contractInterfaces/SolidityTypes'
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
import { PyroToken } from './contractInterfaces/behodler/hephaestus/PyroToken'
import { PyroTokenRegistry } from './contractInterfaces/behodler/hephaestus/PyroTokenRegistry'

import { Celeborn } from './contractInterfaces/behodler/Nimrodel/Celeborn'
import { Miruvor } from './contractInterfaces/behodler/Nimrodel/Miruvor'
import { Rivulet } from './contractInterfaces/behodler/Nimrodel/Rivulet'

//Behodler2
import { Behodler2 } from './contractInterfaces/behodler2/Behodler2'

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

export interface NimrodelContracts {
	Celeborn: Celeborn
	Miruvor: Miruvor
	Rivulet: Rivulet
}

export interface Behodler2Contracts {
	Behodler2: Behodler2,
	Morgoth: Morgoth
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
	PyroToken: PyroToken,
	PyroTokenRegistry: PyroTokenRegistry,
	Nimrodel: NimrodelContracts
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
	getMaxLiquidityExit: () => { }
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

const defaultPyroToken: PyroToken = {
	...defaultBase,
	...defaultSecondary,
	...defaultERC20,
	engulf: (pyroRecipient: address, value: uint) => { },
	burn: (value: uint) => { }
}

const defaultPyroTokenRegistry: PyroTokenRegistry = {
	...defaultBase,
	...defaultSecondary,
	seed: (bellows: address, lachesis: address, kharon: address) => { },
	addToken: (name: string, symbol: string, baseToken: address) => { },
	baseTokenMapping: (base: address) => { },
	pyroTokenMapping: (pToken: address) => { }
}

const defaultCeleborn: Celeborn = {
	...defaultOwnable,
	maxGold: () => { },
	maxSilver: () => { },
	maxBronze: () => { },
	goldThreshold: () => { },
	silverThreshold: () => { },
	bronzeThreshold: () => { },
	safetyDurationMultiplier: () => { },

	//functions
	sponsor: (slot: uint, value: uint, comp: Bytes32, logo: Bytes32, siteURL: Bytes32, message: Bytes) => { },
	seed: (rivulet: address, dai: address) => { },
	setMaxSponsorships: (gold: uint, silver: uint, bronze: uint, multiplier: uint) => { },
	getSponsorshipData: (slot: uint, field: uint) => { },
}

const defaultRivulet: Rivulet = {
	...defaultOwnable,
	...defaultBase,
	celeborn: () => { },
	staked: (user: address) => "",
	tickets: (user: address) => "",
	totalTickets: () => "",
	scxMultiple: (staker: address) => "",
	damHeightAtJoin: (staker: address) => "",
	ponds: (staker: address) => "",
	damHeight: () => { },
	maxTickets: () => { },
	initialDai: () => { },
	timeScale: () => { },
	burnMultiple: () => { },
	ticketSize: () => { },
	lastDrip: () => { },

	//functions
	seed: (dai: address, scx: address, celeborn: address, time: uint, burnMultiple: uint, maxTickets: uint) => { },
	setTicketParameters: (ticketSize: uint, maxTickets: uint) => { },
	setBurnMultiple: (b: uint) => { },
	celebrant: (value: uint) => { },
	dripIfStale: () => { },
	drip: () => { },
	drainPond: () => { },
	stake: (stakeValue: uint, burnValue: uint) => { },
	unstake: (scx: uint) => { },
	aggregateFlow: () => { },
}

const defaultMiruvor: Miruvor = {
	...defaultOwnable,
	discount: () => { },
	SCXperToken: (token: address) => "",

	//functions
	setMarkup: (markup: uint) => { },
	seed: (scx: address, behodler: address, lachesis: address, janus: address, weth: address, registry: address, dai: address, weidai: address) => { },
	canDrink: (token: address) => { },
	refresh: (token: address) => { },
	drink: (token: address, value: uint) => { },
	drinkEth: () => { },
	stopperEth: () => { },
	stopper: (token: address) => { },
	calculateSCXperToken: (token: address, scx: address) => { },
}

const defaultNimrodel: NimrodelContracts = {
	Celeborn: defaultCeleborn,
	Miruvor: defaultMiruvor,
	Rivulet: defaultRivulet
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
	swap: (scx1: uint) => { },
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
	Morgoth: defaultMorgoth
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
	Lachesis: defaultLachesis,
	PyroToken: defaultPyroToken,
	PyroTokenRegistry: defaultPyroTokenRegistry,
	Nimrodel: defaultNimrodel
}

export const DefaultContracts: IContracts = {
	behodler: DefaultBehodlerContracts
}