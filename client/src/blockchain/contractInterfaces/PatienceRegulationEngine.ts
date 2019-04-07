import { uint, TX, address } from "./SolidityTypes";
import { Secondary } from './Secondary';

interface getCurrentAdjustmentWeightCall{
	call:()=>Promise<uint>
}

interface getBlockOfPurchaseCall{
	call:()=>Promise<uint>
}

interface getClaimWindowsPerAdjustmentCall{
	call:()=>Promise<uint>
}

interface getLastAdjustmentBlockNumberCall{
	call:()=>Promise<uint>
}

interface getCurrentPenaltyCall{
	call:()=>Promise<uint>
}

interface getLockedWeiDaiCall{
	call:(hodler:address)=>Promise<uint>
}

interface getClaimWaitWindowCall{
	call:()=>Promise<uint>
}

export interface PatienceRegulationEngine extends Secondary{
	getCurrentAdjustmentWeight:getCurrentAdjustmentWeightCall
	getBlockOfPurchase:getBlockOfPurchaseCall
	getClaimWindowsPerAdjustment:getClaimWindowsPerAdjustmentCall
	getLastAdjustmentBlockNumber:getLastAdjustmentBlockNumberCall
	getCurrentPenalty:getCurrentPenaltyCall
	getLockedWeiDai:getLockedWeiDaiCall
	getClaimWaitWindow:getClaimWaitWindowCall

	setDependencies:(bank:address,weiDai:address,options:Object) => Promise<TX> 
	setClaimWindowsPerAdjustment:(c:uint,options:Object)=> Promise<TX>
	buyWeiDai:(dai:uint,split:uint,options:Object)=>Promise<TX>
	claimWeiDai:(options:Object)=>Promise<TX>
}