import { address, uint } from "../SolidityTypes";
import { Secondary } from '../Secondary';
import { BaseContract } from '../BaseContract';

export interface Janus extends BaseContract, Secondary {
    seed: (scx: address, weth: address, behodler: address) => any
    //user must authorize behodler to take input token
    tokenToToken: (input: address, output: uint, value: uint, minPrice: uint, maxPrice: uint) => any
    ethToToken: (output: address, minPrice: uint, maxPrice: uint) => any
    //user must authorize weth for Janus
    tokenToEth: (input: address, value: uint, minPrice: uint, maxPrice: uint) => any
}