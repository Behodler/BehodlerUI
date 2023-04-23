import { address, uint8 } from '../SolidityTypes'
import { Ownable } from '../Ownable'
export interface LiquidityReceiverV3 extends Ownable {
    registerPyroToken: (baseToken: address, name:string,symbol:string,decimals:uint8) => any
    drain: (baseToken: address) => any
    getPyroToken: (baseToken: address) => any
}