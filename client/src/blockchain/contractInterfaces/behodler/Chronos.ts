import { address } from "../SolidityTypes";
import { Secondary } from '../Secondary';
import { BaseContract } from '../BaseContract';

export interface Chronos extends BaseContract, Secondary {
    seed: (behodler: address) => any
}