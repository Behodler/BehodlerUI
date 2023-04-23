import { uint } from '../SolidityTypes'
import { ERC20 } from '../ERC20'
export interface PyrotokenV2 extends ERC20 {
    baseToken: () => any
    mint: (baseTokenAmount: uint) => any
    redeem: (pyroTokenAmount: uint) => any
    redeemRate: () => any
    burn: (amount: uint) => any
}