import { address, Bytes32, uint } from '../SolidityTypes'
import { Empowered } from "./Powers"
import { Thangorodrim } from "./Thangorodrim"

export interface Angband extends Empowered, Thangorodrim {
    authorizedInvokers: (user: address) => any
    ironCrown: () => void
    finalizeSetup: () => void
    authorizeInvoker: (invoker: address, authorized: boolean) => void
    setPowersRegistry: (powers: address) => void
    mapDomain: (location: address, domain: Bytes32) => void
    relinquishDomain: (domain: Bytes32) => void
    setBehodler: (behodler: address, lachesis: address) => void
    executePower: (powerInvoker: address) => void
    executeOrder66: () => void
    withdrawSCX: (amount: uint) => void
}