import { address, uint } from "../../SolidityTypes";
import { Secondary } from '../../Secondary';
import { BaseContract } from '../../BaseContract';
import { ERC20 } from "../../ERC20"

export interface PyroToken extends BaseContract, Secondary, ERC20 {
    engulf: (pyroRecipient: address, value: uint) => any
    burn: (value: uint) => any
}