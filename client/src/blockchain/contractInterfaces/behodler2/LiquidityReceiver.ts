import { address, } from '../SolidityTypes'
import { BaseContract } from '../BaseContract'
export interface LiquidityReceiver extends BaseContract {
    registerPyroToken: (baseToken: address) => any
    drain: (pyroToken: address) => any
}