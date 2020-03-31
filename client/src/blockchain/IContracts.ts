import { PatienceRegulationEngine } from './contractInterfaces/PatienceRegulationEngine'
import { WeiDai } from './contractInterfaces/WeiDai'
import { WeiDaiBank } from './contractInterfaces/WeiDaiBank'
import { address, uint, Bytes16 } from './contractInterfaces/SolidityTypes'
import { ERC20 } from './contractInterfaces/ERC20'
import { WeiDaiVersionController } from './contractInterfaces/WeiDaiVersionController'
import { PotReserve } from './contractInterfaces/PotReserve'

import { Behodler } from './contractInterfaces/behodler/Behodler'
import { Chronos } from './contractInterfaces/behodler/Chronos'
import { Janus } from './contractInterfaces/behodler/Janus'
import { Kharon } from './contractInterfaces/behodler/Kharon'
import { Prometheus } from './contractInterfaces/behodler/Prometheus'
import { Scarcity } from './contractInterfaces/behodler/Scarcity'
import { Weth } from './contractInterfaces/behodler/Weth'
//hephaestu
import { Bellows } from './contractInterfaces/behodler/hephaestus/Bellows'
import { Lachesis } from './contractInterfaces/behodler/hephaestus/Lachesis'
import { PyroToken } from './contractInterfaces/behodler/hephaestus/PyroToken'
import { PyroTokenRegistry } from './contractInterfaces/behodler/hephaestus/PyroTokenRegistry'


export interface BehodlerContracts {
	Behodler: Behodler,
	Chronos: Chronos,
	Janus: Janus,
	Kharon: Kharon,
	Prometheus: Prometheus,
	Scarcity: Scarcity,
	Weth: Weth,
	Bellows: Bellows,
	Lachesis: Lachesis,
	PyroToken: PyroToken,
	PyroTokenRegistry: PyroTokenRegistry
}

export default interface IContracts {
	WeiDai: WeiDai
	PRE: PatienceRegulationEngine
	WeiDaiBank: WeiDaiBank
	Dai: ERC20
	VersionController: WeiDaiVersionController,
	PotReserve: PotReserve,
	activeVersion: string,
	behodler: BehodlerContracts
}

const defaultBase = {
	address: "0x0"
}

const defaultSecondary = {
	primary: () => { },
	transferPrimary: (recipient: string) => { }
}

const defaultERC20 = {
	totalSupply: () => { },
	balanceOf: (address: address) => { },
	allowance: (owner: address, spender: address) => { },
	transfer: (to: address, value: Uint16Array) => { },
	approve: (spender: address, value: uint) => { },
	transferFrom: (from: address, to: address, value: uint) => { },
	increaseAllowance: (spender: address, addedValue: uint) => { },
	decreaseAllowance: (spender: address, subtractedValue: uint) => { },
	decimals: () => { },
	symbol: () => { },
	name: () => { }
}

const defaultVersioned = {
	setVersionController: (address: address) => { }
}

const defaultWeiDai: WeiDai = {
	...defaultBase,
	...defaultSecondary,
	...defaultERC20,
	...defaultVersioned,
	name: () => { },
	symbol: () => { },
	decimals: () => { },

	setBank: (bank: address, authorize: boolean) => { },
	issue: (recipient: address, value: uint) => { },
	burn: (from: address, value: uint) => { },
	versionedBalanceOf: (holder: address, version: address) => { }
}

const defaultPRE: PatienceRegulationEngine = {
	...defaultBase,
	...defaultSecondary,
	...defaultVersioned,
	getCurrentAdjustmentWeight: () => { },
	getBlockOfPurchase: () => { },
	getClaimWindowsPerAdjustment: () => { },
	getLastAdjustmentBlockNumber: () => { },
	getCurrentPenalty: () => { },
	getLockedWeiDai: (hodler: address) => { },
	getClaimWaitWindow: () => { },
	calculateCurrentPenalty: (holder: address, blockNumber: uint) => { },
	getPenaltyDrawdownPeriodForHolder: (holder: address) => { },
	setDependencies: (bank: address, weiDai: address) => { },
	setClaimWindowsPerAdjustment: (c: uint) => { },
	buyWeiDai: (dai: uint, split: uint) => { },
	claimWeiDai: () => { },
	versionedLockedWeiDai: (holder: address, version: uint) => { }
}

const defaultWeiDaiBank: WeiDaiBank = {
	...defaultBase,
	...defaultSecondary,
	...defaultVersioned,
	setDependencies: (weiDai: address, dai: address, pre: address) => { },
	setDonationAddress: (donation: address) => { },
	getDonationAddress: () => { },
	daiPerMyriadWeidai: () => { },
	issue: (sender: address, weidai: uint, dai: uint) => { },
	redeemWeiDai: (weiDai: uint) => { },
	withdrawDonations: () => { }
}

const defaultDai: ERC20 = {
	...defaultERC20,
	...defaultBase
}

const defaultVersionController: WeiDaiVersionController = {
	...defaultSecondary,
	...defaultBase,
	setContractGroup: (v: uint, weiDai: address, dai: address, pre: address, bank: address, name: Bytes16, enabled: boolean) => { },
	getWeiDai: (v: uint) => { },
	getDai: (v: uint) => { },
	getPRE: (v: uint) => { },
	getWeiDaiBank: (v: uint) => { },
	getContractFamilyName: (v: uint) => { },
	renameContractFamily: (v: uint, name: Bytes16) => { },
	setEnabled: (v: uint, enabled: boolean) => { },
	isEnabled: (v: uint) => { },
	setActiveVersion: (v: uint) => { },
	getUserActiveVersion: (user: address) => { },
	setDefaultVersion: (v: uint) => { },
	getDefaultVersion: () => { },
	getContractVersion: (contract: address) => { },
	claimAndRedeem: (version: uint) => { }
}

const defaultPotReserve: PotReserve = {
	...defaultBase,
	...defaultSecondary,
	transferToNewReserve: (reserve: address) => { }
}

const defaultBehodler: Behodler = {
	...defaultBase,
	...defaultSecondary,
	seed: (lachesis: address, kharon: address, janus: address, chronos: address) => { },
	calculateAverageScarcityPerToken: (token: address, value: uint) => { }
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
	tokenToEth: (input: address, value: uint, minPrice: uint, maxPrice: uint) => { }
}

const defaultKharon: Kharon = {
	...defaultBase,
	...defaultSecondary,
	setTollRate: (toll: uint) => { },
	seed: (bellows: address, behodler: address, prometheus: address, weiDaiBank: address, dai: address, weidai: address, scar: address, cut: uint, donationAddress: address) => { },
	toll: (token: address, value: uint) => { },
	withdrawDonations: (token: address) => { },
}

const defaultPrometheus: Prometheus = {
	...defaultBase,
	...defaultSecondary,
	seed: (kharon: address, scarcity: address, weidai: address, dai: address, registry: address) => { },
	stealFlame: (token: address, value: uint) => { },
	withdrawDonations: (token: address) => { }
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
	addToken: (name: string, symbol: string, baseToken: address) => { }
}

export const DefaultBehodlerContracts: BehodlerContracts = {
	Behodler: defaultBehodler,
	Chronos: defaultChronos,
	Janus: defaultJanus,
	Kharon: defaultKharon,
	Prometheus: defaultPrometheus,
	Scarcity: defaultScarcity,
	Weth: defaultWeth,
	Bellows: defaultBellows,
	Lachesis: defaultLachesis,
	PyroToken: defaultPyroToken,
	PyroTokenRegistry: defaultPyroTokenRegistry
}

export const DefaultContracts: IContracts = {
	WeiDai: defaultWeiDai,
	PRE: defaultPRE,
	WeiDaiBank: defaultWeiDaiBank,
	Dai: defaultDai,
	VersionController: defaultVersionController,
	PotReserve: defaultPotReserve,
	activeVersion: "0",
	behodler: DefaultBehodlerContracts
}