import { address, uint } from "../SolidityTypes";
import { Secondary } from '../Secondary';
import { BaseContract } from '../BaseContract';

export interface Prometheus extends BaseContract, Secondary {
    seed: (kharon: address, scarcity: address, weidai: address, dai: address, registry: address) => any
    stealFlame: (token: address, value: uint) => any
    withdrawDonations: (token: address) => any
}