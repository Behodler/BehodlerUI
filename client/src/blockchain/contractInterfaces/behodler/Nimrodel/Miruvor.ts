import { address, uint } from "../../SolidityTypes";
import { Ownable } from '../../Ownable';
import { BaseContract } from '../../BaseContract';

export interface Miruvor extends BaseContract, Ownable {
    //fields
    discount: () => any
    SCXperToken: (token: address) => uint

    //functions
    setMarkup: (markup: uint) => any
    seed: (scx: address, behodler: address, lachesis: address, janus: address, weth: address, registry: address, dai: address, weidai: address) => any
    canDrink: (token: address) => any
    refresh: (token: address) => any
    drink: (token: address, value: uint) => any
    drinkEth: () => any
    stopperEth: () => any
    stopper: (token: address) => any
    calculateSCXperToken: (token: address, scx: address) => any
}