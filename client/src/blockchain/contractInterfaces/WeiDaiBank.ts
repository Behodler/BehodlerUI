import { uint, address } from "./SolidityTypes";
import { Secondary } from './Secondary';
import { BaseContract } from './BaseContract';

export interface WeiDaiBank extends Secondary, BaseContract {
	setDependencies: (weiDai: address, dai: address, pre: address) => any
	setDonationAddress: (donation: address) => any
	daiPerMyriadWeidai: () => any
	issue: (sender: address, weidai: uint, dai: uint) => any
	redeemWeiDai: (weiDai: uint) => any
	withdrawDonations: () => any
}