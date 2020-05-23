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
//hephaestus
import { Bellows } from './contractInterfaces/behodler/hephaestus/Bellows'
import { Lachesis } from './contractInterfaces/behodler/hephaestus/Lachesis'
import { PyroToken } from './contractInterfaces/behodler/hephaestus/PyroToken'
import { PyroTokenRegistry } from './contractInterfaces/behodler/hephaestus/PyroTokenRegistry'
//sisyphus
import { Sisyphus } from './contractInterfaces/behodler/Sisyphus/Sisyphus'
import {Faucet} from './contractInterfaces/behodler/Sisyphus/Faucet'

export interface SisyphusContracts {
	Sisyphus: Sisyphus
	Faucet:Faucet
}

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
	PyroTokenRegistry: PyroTokenRegistry,
	Sisyphus:SisyphusContracts
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

const defaultOwnable = {
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
	calculateAverageScarcityPerToken: (token: address, value: uint) => { },
	tokenScarcityObligations: (token: string) => { },
	buyDryRun: (tokenAddress: address, value: uint, minPrice: uint) => { },
	sellDryRun: (tokenAddress: address, scarcityValue: uint, maxPrice: uint) => { }
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

const defaultSisyphus: Sisyphus = {
	...defaultBase,
	...defaultOwnable,
	enable: (e: boolean) => { },
	setTime: (periodDurationType: uint, totalIncrements: uint) => { },
	setRewardProportion: (proportion: uint) => { },
	seed: (scx: address) => { },
	struggle: (scarcityForwarded: uint) => { },
	calculateCurrentBuyout: () => { },
	enabled: () => { },
	rewardProportion: () => { },
	currentMonarch: () => { },
	scarcity: () => { },
	buyoutAmount: () => { },
	buyoutTime: () => { },
	periodDuration: () => { },
	totalIncrements: () => { },
	faucet: () => { }
}

const defaultFaucet:Faucet = {
	...defaultOwnable,
	...defaultBase,
	seed:(scx:address)=>{},
    calibrate:(dripInterval:uint,drips:uint) =>{},
    drip:()=>{},
    takeDonation:(value:uint)=>{}
}

const defaultSisyphusContracts:SisyphusContracts = {
	Sisyphus:defaultSisyphus,
	Faucet: defaultFaucet
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
	PyroTokenRegistry: defaultPyroTokenRegistry,
	Sisyphus: defaultSisyphusContracts
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