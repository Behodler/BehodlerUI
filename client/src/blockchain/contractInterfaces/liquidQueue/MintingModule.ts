
import { address, uint, uint8 } from '../SolidityTypes'
import { Ownable } from '../Ownable'
export interface MintingModule extends Ownable {
    //view
    inputTokenTilting: (token: address) => any
    inputOutputToken: (token: address) => any
    tiltPercentage:()=>any
    //State Change
    purchaseLP: (inputToken: address, amount: uint) => any
    //Ownable
    pop: () => any
    transferOwnership: (newOwner: address) => any
    seed: (factory: address, router: address, reward: address, tiltPercentage: uint8) => any
    mapTokens: (input: address, output: address, tilting: address) => any
    setSluiceGate: (gate: address) => any
  
}