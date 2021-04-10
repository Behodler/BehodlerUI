import { address, uint, int } from './contractInterfaces/SolidityTypes'
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
import { BehodlerPrice } from './contractInterfaces/behodler2/BehodlerPrice'
import { Lachesis as Lachesis2 } from './contractInterfaces/behodler2/Lachesis'
import { LiquidityReceiver } from './contractInterfaces/behodler2/LiquidityReceiver'

export interface Behodler2Contracts {
	Behodler2: Behodler2,
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
	behodlerPrice: BehodlerPrice
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




const defaultBehodler2: Behodler2Contracts = {
	Behodler2: defaultBehodler2Contract,
	Lachesis: defaultLachesis2,
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


export const DefaultBehodlerPrice: BehodlerPrice = {
	addLiquidity: (amount: uint, amountInPool: uint, burnFee: uint) => { },
}

export const DefaultContracts: IContracts = {
	behodler: DefaultBehodlerContracts,
	behodlerPrice: DefaultBehodlerPrice,
}