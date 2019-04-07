import { uint, TX, address } from "./SolidityTypes";
import { Secondary } from './Secondary';

interface daiPerMyriadWeidaiCall {
	call: () => Promise<uint>
}

export interface WeiDaiBank extends Secondary {
	setDependencies: (weiDai: address, dai: address, pre: address, options: Object) => Promise<TX>
	setDonationAddress: (donation: address, options: Object) => Promise<TX>
	daiPerMyriadWeidai: daiPerMyriadWeidaiCall
	issue: (sender: address, weidai: uint, dai: uint, options: Object) => Promise<TX>
	redeemWeiDai: (weiDai: uint, options: Object) => Promise<TX>
	withdrawDonations: (options: Object) => Promise<TX>
}