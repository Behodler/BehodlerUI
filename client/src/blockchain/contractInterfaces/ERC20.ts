import { uint, address, TX } from './SolidityTypes'
import { call } from './CallableMethodInterface'

export interface ERC20 {
	totalSupply: () => call<uint>
	balanceOf: (address: address) => call<uint>
	allowance: (owner: address, spender: address) => call<uint>
	transfer: (to: address, value: uint, options: Object) => Promise<TX>
	approve: (sender: address, value: uint, options: Object) => Promise<TX>
	transferFrom: (from: address, to: address, value: uint, options: Object) => Promise<TX>
	increaseAllowance: (spender: address, addedValue: uint, options: Object) => Promise<TX>
	decreaseAllowance: (spender: address, subtractedValue: uint, options: Object) => Promise<TX>
}