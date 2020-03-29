import { PatienceRegulationEngine } from './contractInterfaces/PatienceRegulationEngine'
import { WeiDai } from './contractInterfaces/WeiDai'
import { WeiDaiBank } from './contractInterfaces/WeiDaiBank'
import { address,uint, Bytes16 } from './contractInterfaces/SolidityTypes'
import { ERC20 } from './contractInterfaces/ERC20'
import { WeiDaiVersionController } from './contractInterfaces/WeiDaiVersionController'
import { PotReserve } from './contractInterfaces/PotReserve'

export default interface IContracts{
	WeiDai: WeiDai
	PRE: PatienceRegulationEngine
	WeiDaiBank: WeiDaiBank
	Dai: ERC20
	VersionController: WeiDaiVersionController,
	PotReserve: PotReserve,
	activeVersion:string
}

const defaultBase = {
	address:"0x0"
}

const defaultSecondary = {
	primary: () => {},
	transferPrimary: (recipient: string) =>{}
}

const defaultERC20 = {
	totalSupply: () => {},
	balanceOf: (address: address) => {},
	allowance: (owner: address, spender: address) => {},
	transfer: (to: address, value: Uint16Array) => {},
	approve: (spender: address, value: uint) => {},
	transferFrom: (from: address, to: address, value: uint) => {},
	increaseAllowance: (spender: address, addedValue: uint) => {},
	decreaseAllowance: (spender: address, subtractedValue: uint) => {},
	decimals:()=>{},
	symbol:()=>{},
	name:()=>{}
}

const defaultVersioned = {
	setVersionController: (address: address) => {}
}

const defaultWeiDai:WeiDai = {
	...defaultBase,
	...defaultSecondary,
	...defaultERC20,
	...defaultVersioned,
	name: () => {},
	symbol: () => {},
	decimals: () => {},

	setBank: (bank: address, authorize: boolean) => {},
	issue: (recipient: address, value: uint) => {},
	burn: (from: address, value: uint) => {},
	versionedBalanceOf:(holder:address,version:address) => {}
}

const defaultPRE:PatienceRegulationEngine = {
	...defaultBase,
	...defaultSecondary,
	...defaultVersioned,
	getCurrentAdjustmentWeight: () => {},
	getBlockOfPurchase: () => {},
	getClaimWindowsPerAdjustment: () => {},
	getLastAdjustmentBlockNumber: () => {},
	getCurrentPenalty: () => {},
	getLockedWeiDai: (hodler: address) => {},
	getClaimWaitWindow: () => {},
	calculateCurrentPenalty: (holder: address, blockNumber: uint) => {},
	getPenaltyDrawdownPeriodForHolder: (holder: address) => {},
	setDependencies: (bank: address, weiDai: address) => {},
	setClaimWindowsPerAdjustment: (c: uint) => {},
	buyWeiDai: (dai: uint, split: uint) => {},
	claimWeiDai: () => {},
	versionedLockedWeiDai: (holder: address, version: uint) => {}
}

const defaultWeiDaiBank:WeiDaiBank = {
	...defaultBase,
	...defaultSecondary,
	...defaultVersioned,
	setDependencies: (weiDai: address, dai: address, pre: address) => {},
	setDonationAddress: (donation: address) => {},
	getDonationAddress: () => {},
	daiPerMyriadWeidai: () => {},
	issue: (sender: address, weidai: uint, dai: uint) => {},
	redeemWeiDai: (weiDai: uint) => {},
	withdrawDonations: () => {}
}

const defaultDai:ERC20 = {
	...defaultERC20,
	...defaultBase
}

const defaultVersionController:WeiDaiVersionController = {
	...defaultSecondary,
	...defaultBase,
	setContractGroup: (v: uint, weiDai: address, dai: address, pre: address, bank: address, name: Bytes16, enabled: boolean) => {},
	getWeiDai: (v: uint) => {},
	getDai: (v: uint) => {},
	getPRE: (v: uint) => {},
	getWeiDaiBank: (v: uint) => {},
	getContractFamilyName: (v: uint) => {},
	renameContractFamily: (v: uint, name: Bytes16) => {},
	setEnabled: (v: uint, enabled: boolean) => {},
	isEnabled: (v: uint) => {},
	setActiveVersion: (v: uint) => {},
	getUserActiveVersion: (user: address) => {},
	setDefaultVersion: (v: uint) => {},
	getDefaultVersion:()=>{},
	getContractVersion: (contract: address) => {},
	claimAndRedeem: (version:uint) => {}
}

const defaultPotReserve:PotReserve = {
	...defaultBase,
	...defaultSecondary,
	transferToNewReserve: (reserve:address)=>{}
}

export const DefaultContracts:IContracts = {
	WeiDai:defaultWeiDai,
	PRE:defaultPRE,
	WeiDaiBank:defaultWeiDaiBank,
	Dai:defaultDai,
	VersionController:defaultVersionController,
	PotReserve:defaultPotReserve,
	activeVersion:"0"
}