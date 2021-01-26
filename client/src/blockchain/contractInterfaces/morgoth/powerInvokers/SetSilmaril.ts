import { PowerInvoker } from "../Powers"
import { address, uint8,uint16 } from '../..//SolidityTypes'

export interface SetSilmarilPower extends PowerInvoker {
    parameterize: (index:uint8,percentage:uint16,exit:address) => any
}