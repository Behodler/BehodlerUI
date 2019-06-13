import { uint, TX, address } from "./SolidityTypes";
import { Secondary } from './Secondary';
import { call } from './CallableMethodInterface'

export interface PatienceRegulationEngine extends Secondary {
	getCurrentAdjustmentWeight: () => call<uint>
	getBlockOfPurchase: () => call<uint>
	getClaimWindowsPerAdjustment: () => call<uint>
	getLastAdjustmentBlockNumber: () => call<uint>
	getCurrentPenalty: () => call<uint>
	getLockedWeiDai: (hodler: address) => call<uint>
	getClaimWaitWindow: () => call<uint>
	calculateCurrentPenalty: (holder: address) => call<uint>
	setDependencies: (bank: address, weiDai: address, options: Object) => Promise<TX>
	setClaimWindowsPerAdjustment: (c: uint, options: Object) => Promise<TX>
	buyWeiDai: (dai: uint, split: uint, options: Object) => Promise<TX>
	claimWeiDai: (options: Object) => Promise<TX>
}