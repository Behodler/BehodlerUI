import { address, uint, uint24, uint8 } from '../SolidityTypes'
import { Ownable } from '../Ownable'
export interface LiquidQueue extends Ownable {
    //State Change
    join: (LP: address, recipient: address) => any
    //View
    getQueueData: () => any
    getBatch: (index:number) => any
    //Ownable
    pop: () => any
    transferOwnership: (newOwner: address) => any
    setReward: (reward: address) => any
    setMintingModule: (m: address) => any
    configure: (targetVelocity: uint24, size: uint8, eye: address, stagnationRewardTimeout: uint, eyeReward: uint, LPburnDisabled: boolean) => any
    pause: (paws: boolean) => any
}