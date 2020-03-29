import { uint, address } from "../../SolidityTypes";
import { Secondary } from '../../Secondary';
import { BaseContract } from '../../BaseContract';

export interface Bellows extends BaseContract, Secondary {
	seed: (lachesisAddress: address, pyroTokenRegistry: address) => any
	open: (baseToken: address, value: uint) => any
	blast: (pyroToken: address, value: uint) => any
	getLastAdjustmentBlockNumber: () => any
	getRedeemRate: (pyroToken: address) => any
}