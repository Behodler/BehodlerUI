import { address, Bytes32, uint } from '../SolidityTypes'
import { Empowered } from "./Powers"
import { Thangorodrim } from "./Thangorodrim"

export default interface Angband extends Empowered, Thangorodrim {
    authorizedInvokers: (user: address) => any
    ironCrown: () => any
    finalizeSetup: () => any
    authorizeInvoker: (invoker: address, authorized: boolean) => any
    setPowersRegistry: (powers: address) => any
    mapDomain: (location: address, domain: Bytes32) => any
    relinquishDomain: (domain: Bytes32) => any
    setBehodler: (behodler: address, lachesis: address) => any
    executePower: (powerInvoker: address) => any
    executeOrder66: () => any
    withdrawSCX: (amount: uint) => any
}