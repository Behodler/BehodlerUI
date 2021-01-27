import { Bytes32, address } from '../SolidityTypes'
import "../Ownable.ts"
import { Ownable } from '../Ownable'
import {BaseContract} from '../BaseContract'
export interface PowerInvoker extends BaseContract {
    power: () => any
    registry: () => any
    angband: () => any
    destruct: () => any
    invoke: (minion: Bytes32, sender: address) => any
}

export interface Empowered extends Ownable {
    changePower: (registry: address) => any
}

export interface PowersRegistry extends Empowered {
    NULL: () => any
    POINT_TO_BEHODLER: () => any
    WIRE_ANGBAND: () => any
    CHANGE_POWERS: () => any
    CONFIGURE_THANGORODRIM: () => any
    SEIZE_POWER: () => any
    CREATE_NEW_POWER: () => any
    BOND_USER_TO_MINION: () => any
    ADD_TOKEN_TO_BEHODLER: () => any
    CONFIGURE_SCARCITY: () => any
    VETO_BAD_OUTCOME: () => any
    DISPUTE_DECISION: () => any
    SET_DISPUTE_TIMEOUT: () => any
    INSERT_SILMARIL: () => any
    AUTHORIZE_INVOKER: () => any
    TREASURER: () => any

    powers: (p: Bytes32) => any
    userMinion: (user: address) => any

    seed: () => any
    userHasPower: (power: Bytes32, user: address) => any
    isUserMinion: (user: address, minion: Bytes32) => any
    create: (power: Bytes32, domain: Bytes32, transferrable: boolean, unique: boolean) => any
    destroy: (power: Bytes32) => any
    pour: (power: Bytes32, minion_to: Bytes32) => any
    spread: (power: Bytes32, minion_to: Bytes32) => any
    castIntoVoid: (user: address, minion: Bytes32) => any
    bondUserToMinion: (user: address, minion: Bytes32) => any
}