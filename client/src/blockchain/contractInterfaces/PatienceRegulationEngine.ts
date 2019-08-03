import { uint, address } from "./SolidityTypes";
import { Secondary } from './Secondary';
import { BaseContract } from './BaseContract';

export interface PatienceRegulationEngine extends BaseContract, Secondary {
	methodFactory:any
	getCurrentAdjustmentWeight: () => any
	getBlockOfPurchase: () => any
	getClaimWindowsPerAdjustment: () => any
	getLastAdjustmentBlockNumber: () => any
	getCurrentPenalty: () => any
	getLockedWeiDai: (hodler: address) => any
	getClaimWaitWindow: () => any
	calculateCurrentPenalty: (holder: address) => any
	getPenaltyDrawdownPeriodForHolder: (holder: address) => any
	setDependencies: (bank: address, weiDai: address) => any
	setClaimWindowsPerAdjustment: (c: uint) => any
	buyWeiDai: (dai: uint, split: uint) => any
	claimWeiDai: () => any
}