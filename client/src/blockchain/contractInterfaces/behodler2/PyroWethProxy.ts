import { BaseContract } from '../BaseContract'
import { address } from '../SolidityTypes'

export interface PyroWethProxy extends BaseContract {
    pyroWeth: () => any
    balanceOf:(holder:address)=>any
    redeem: (amount: any) => any
    mint: (baseTokenAmount: any) => any
}