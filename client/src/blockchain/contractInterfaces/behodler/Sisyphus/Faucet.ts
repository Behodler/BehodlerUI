import { address, uint } from "../../SolidityTypes"
import { Ownable } from '../../Ownable'
import { BaseContract } from '../../BaseContract'

export interface Faucet extends Ownable, BaseContract {
    seed:(scx:address)=>any
    calibrate:(dripInterval:uint,drips:uint) =>any
    drip:()=>any
    takeDonation:(value:uint)=>any
    lastRecipient: ()=>any,
    dripsRemaining:()=>any
    dripSize:()=>any
    lastDrip:()=>any
    dripInterval: ()=>any
    scarcity: ()=>any
    drips:()=>any
    lastKnownBalance:()=>any
    replaceWasher:()=>any
}