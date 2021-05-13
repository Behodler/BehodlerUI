import { address, uint, } from '../SolidityTypes'
import { Ownable } from '../Ownable'
export interface Reward extends Ownable {
    //view
    canReward:( token:address,  amount:uint)=> any
    //Ownable
    withdraw:( token:address)=>any
    transferOwnership: (newOwner: address) => any
    seed: (mintingModule: address, _liquidQueue: address, _ironCrown: address, eye: address, scx: address) => any
    toggle:(e:boolean)=>any
}
