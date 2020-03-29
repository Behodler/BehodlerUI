import { address, uint } from "../SolidityTypes";
import { Secondary } from '../Secondary';
import { BaseContract } from '../BaseContract';

export interface PyroToken extends BaseContract, Secondary {
    seed: (lachesis: address, kharon: address, janus: address, chronos: address) => any
    calculateAverageScarcityPerToken: (token: address, value: uint) => any
}