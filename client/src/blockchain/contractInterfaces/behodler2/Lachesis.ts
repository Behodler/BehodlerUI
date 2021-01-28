import { address } from '../SolidityTypes'
import { Ownable } from '../Ownable'
export interface Lachesis extends Ownable {
    cut: (token: address) => any
    measure: (token: address, valid: boolean, burnable: boolean) => any
    measureLP: (token1: address, token2: address) => any
}