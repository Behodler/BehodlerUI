import { PowerInvoker } from "../Powers"
import { address, uint } from '../..//SolidityTypes'

export interface ConfigureScarcity extends PowerInvoker {
    parameterize: (transferfee:uint,burnfee:uint,feeDestination:address) => any
}