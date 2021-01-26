import { address, uint8, uint16 } from '../SolidityTypes'
import { Empowered } from "./Powers"

export interface IronCrown extends Empowered {
    setSCX: (scx: address) => any
    settlePayments: () => any
    setSilmaril: (index: uint8, percentage: uint16, exit: address) => any
    getSilmaril: (index: uint8) => any
}