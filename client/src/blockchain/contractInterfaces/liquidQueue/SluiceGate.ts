
import { address, uint, uint8 } from '../SolidityTypes'
import { Ownable } from '../Ownable'
export interface SluiceGate extends Ownable {
    //State Change
    betaApply: (lp:address) => any
    unstake:(lp:address)=>any
    //Ownable
    configureLPs:(lp:address,index:uint8,required:uint)=>any
    transferOwnership: (newOwner: address) => any
    setSluiceGate:(gate:address)=>any
}