import { address, uint, int, uint256, uint8 } from './contractInterfaces/SolidityTypes'

import { Weth } from './contractInterfaces/behodler/Weth'


//Behodler2
import { Behodler2 } from './contractInterfaces/behodler2/Behodler2'
import { Lachesis as Lachesis2 } from './contractInterfaces/behodler2/Lachesis'
import { LiquidityReceiverV2 } from './contractInterfaces/behodler2/LiquidityReceiverV2'
import { PyroWeth10Proxy } from './contractInterfaces/behodler2/PyroWeth10Proxy'

//Limbo
import { TokenProxyRegistry } from './contractInterfaces/limbo/TokenProxyRegistry'

//Pyrotokens3
import { V2Migrator } from './contractInterfaces/pyrotokens/V2Migrator'
import { LiquidityReceiverV3 } from './contractInterfaces/behodler2/LiquidityReceiverV3'
import { PyroWethProxy } from './contractInterfaces/behodler2/PyroWethProxy'

export interface Behodler2Contracts {
	Behodler2: Behodler2
	Lachesis: Lachesis2
	LiquidityReceiverV2: LiquidityReceiverV2
	LiquidityReceiverV3: LiquidityReceiverV3
	Weth10: Weth
	PyroWeth10Proxy: PyroWeth10Proxy
	PyroWethProxy: PyroWethProxy
	LimboTokenProxyRegistry: TokenProxyRegistry
	PyroV2Migrator: V2Migrator
}

export interface BehodlerContracts {
	Behodler2: Behodler2Contracts,
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

const defaultLachesis2: Lachesis2 = {
	...defaultOwnable,
	cut: (token: address) => { },
	measure: (token: address, valid: boolean, burnable: boolean) => { },
	measureLP: (token1: address, token2: address) => { }
}

const defaultLiquidityReceiverV2: LiquidityReceiverV2 = {
	...defaultOwnable,
	registerPyroToken: (baseToken: address) => { },
	drain: (pyroToken: address) => { },
	baseTokenMapping: (pyrotoken: address) => { }
}

const defaultLiquidityReceiverV3: LiquidityReceiverV3 = {
	...defaultOwnable,
	registerPyroToken: (baseToken: address, name: string, symbol: string, decimals: uint8) => { },
	drain: (baseToken: address) => { },
	getPyroToken: (baseToken: address) => { }
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

const defaultWeth: Weth = {
	...defaultBase,
	...defaultSecondary,
	...defaultERC20,
	deposit: () => { },
	withdraw: (value: uint) => { }
}


const defaultPyroTokenRegistry: PyroWeth10Proxy = {
	...defaultOwnable,
	baseToken: () => { },
	redeem: (amount: {},) => { },
	mint: (baseTokenAmount: {},) => { },
	calculateMintedPyroWeth: (baseTokenAmount: {},) => { },
	calculateRedeemedWeth: (amount: {},) => { },
	redeemRate: () => { }
}

const defaultPyroWethProxy: PyroWethProxy = {
	...defaultBase,
	balanceOf: (amount: uint) => { },
	redeem: (amount: uint) => { },
	mint: (baseTokenAmount: uint) => { },
	pyroWeth: () => { }
}

const defaultLimboTokenProxyRegistry: TokenProxyRegistry = {
	...defaultBase,
	tokenProxy: (address: address) => ['0x0', '0x0'],
}

const defaultPyroV2Migrator: V2Migrator = {
	...defaultBase,
	migrate: (
		pyro2Address: address,
		pyro3Address: address,
		pyro2Amount: uint256,
		pyro3Amount: uint256,
	) => { },
	migrateMany: (
		pyro2Address: address[],
		pyro3Address: address[],
		pyro2Amount: uint256[],
		pyro3Amount: uint256[],
	) => { },
}

export const defaultBehodler2: Behodler2Contracts = {
	Behodler2: defaultBehodler2Contract,
	Lachesis: defaultLachesis2,
	LiquidityReceiverV2: defaultLiquidityReceiverV2,
	LiquidityReceiverV3: defaultLiquidityReceiverV3,
	Weth10: defaultWeth,
	PyroWeth10Proxy: defaultPyroTokenRegistry,
	PyroWethProxy: defaultPyroWethProxy,
	LimboTokenProxyRegistry: defaultLimboTokenProxyRegistry,
	PyroV2Migrator: defaultPyroV2Migrator,
}

export const DefaultBehodlerContracts: BehodlerContracts = {
	Behodler2: defaultBehodler2
}

export const DefaultContracts: IContracts = {
	behodler: DefaultBehodlerContracts
}
