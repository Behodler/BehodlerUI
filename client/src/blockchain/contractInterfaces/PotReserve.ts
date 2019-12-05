import { Secondary } from './Secondary'
import {address } from './SolidityTypes'
import { BaseContract } from './BaseContract';

export interface PotReserve extends BaseContract, Secondary {
	transferToNewReserve: (reserve:address)=>any
}