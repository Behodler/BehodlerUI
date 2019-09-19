import { uint, address } from "./SolidityTypes";
import { Secondary } from './Secondary';
import { BaseContract } from './BaseContract';
import { Versioned } from './Versioned'

export interface PatienceRegulationEngine extends BaseContract, Secondary, Versioned {
	methodFactory: any
	getCurrentAdjustmentWeight: () => any
	getBlockOfPurchase: () => any
	getClaimWindowsPerAdjustment: () => any
	getLastAdjustmentBlockNumber: () => any
	getCurrentPenalty: () => any
	getLockedWeiDai: (hodler: address) => any
	getClaimWaitWindow: () => any
	calculateCurrentPenalty: (holder: address, blockNumber: uint) => any
	getPenaltyDrawdownPeriodForHolder: (holder: address) => any
	setDependencies: (bank: address, weiDai: address) => any
	setClaimWindowsPerAdjustment: (c: uint) => any
	buyWeiDai: (dai: uint, split: uint) => any
	claimWeiDai: () => any
	versionedLockedWeiDai: (holder: address, version: uint) => any
}