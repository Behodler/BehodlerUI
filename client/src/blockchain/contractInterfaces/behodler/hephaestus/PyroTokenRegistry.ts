import { address } from "../../SolidityTypes";
import { Secondary } from '../../Secondary';
import { BaseContract } from '../../BaseContract';

export interface PyroToken extends BaseContract, Secondary {
    seed: (bellows: address, lachesis: address, kharon: address) => any
    addToken: (name: string, symbol: string, baseToken: address) => any
}