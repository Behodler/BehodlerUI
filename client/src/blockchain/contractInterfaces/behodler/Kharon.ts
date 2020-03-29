import { address, uint } from "../SolidityTypes";
import { Secondary } from '../Secondary';
import { BaseContract } from '../BaseContract';

export interface Kharon extends BaseContract, Secondary {
    setTollRate: (toll: uint) => any
    seed: (bellows: address, behodler: address, prometheus: address, weiDaiBank: address, dai: address, weidai: address, scar: address, cut: uint, donationAddress: address) => any
    toll: (token: address, value: uint) => any
    withdrawDonations: (token: address) => any
}