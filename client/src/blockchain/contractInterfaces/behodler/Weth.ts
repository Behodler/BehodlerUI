import { uint } from "../SolidityTypes";
import { Secondary } from '../Secondary';
import { BaseContract } from '../BaseContract';
import { ERC20 } from '../ERC20';

export interface Weth extends BaseContract, Secondary, ERC20 {
    deposit: () => any
    withdraw: (value: uint) => any
}