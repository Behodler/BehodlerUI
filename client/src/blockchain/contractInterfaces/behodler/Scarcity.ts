import { address, uint } from "../SolidityTypes";
import { Secondary } from '../Secondary';
import { BaseContract } from '../BaseContract';
import { ERC20 } from '../ERC20';

export interface Scarcity extends BaseContract, Secondary, ERC20 {
    setBehodler: (behodler: address) => any
    burn: (value: uint) => any
}