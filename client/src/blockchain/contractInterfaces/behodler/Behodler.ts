import { address, uint } from "../SolidityTypes";
import { Secondary } from '../Secondary';
import { BaseContract } from '../BaseContract';

export interface Behodler extends BaseContract, Secondary {
    seed: (lachesis: address, kharon: address, janus: address, chronos: address) => any
    calculateAverageScarcityPerToken: (token: address, value: uint) => any
    tokenScarcityObligations: (token: address) => any
    buyDryRun: (tokenAddress: address, value: uint, minPrice: uint) => any
    sellDryRun: (tokenAddress: address, scarcityValue: uint, maxPrice: uint) => any
}