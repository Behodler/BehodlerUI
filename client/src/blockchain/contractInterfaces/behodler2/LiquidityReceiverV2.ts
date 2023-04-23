import { address } from '../SolidityTypes'
import { Ownable } from '../Ownable'
export interface LiquidityReceiverV2 extends Ownable {
    registerPyroToken: (baseToken: address) => any
    drain: (pyroToken: address) => any
    baseTokenMapping: (pyrotoken: address) => any
}