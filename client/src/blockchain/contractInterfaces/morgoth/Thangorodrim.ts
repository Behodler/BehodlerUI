import { Bytes32 } from "../SolidityTypes";

export interface Thangorodrim {
    POWERREGISTRY: () => any
    BEHODLER: () => any
    LACHESIS: () => any
    IRON_CROWN: () => any
    ANGBAND: () => any

    getAddress:(key:Bytes32)=>any
}