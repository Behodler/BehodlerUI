import { address } from "../../SolidityTypes";
import { Secondary } from '../../Secondary';
import { BaseContract } from '../../BaseContract';

export interface Lachesis extends BaseContract, Secondary {
    setScarcity: (s: address) => any
    measure: (token: address, valid: boolean) => any
    cut: (token: address) => any
}