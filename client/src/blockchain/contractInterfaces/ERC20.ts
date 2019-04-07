import { uint, address, TX } from './SolidityTypes'

interface totalSupplyCall {
	call: () => Promise<uint>
}

interface balanceOfCall {
	call: (address: address) => Promise<uint>
}

interface allowanceCall {
	call: (owner: address, spender: address) => Promise<uint>
}

export interface ERC20 {
	totalSupply: totalSupplyCall
	balanceOf: balanceOfCall
	allowance: allowanceCall
	transfer: (to: address, value: uint, options: Object) => Promise<TX>
	approve: (sender: address, value: uint, options: Object) => Promise<TX>
	transferFrom: (from: address, to: address, value: uint, options: Object) => Promise<TX>
	increaseAllowance: (spender: address, addedValue: uint, options: Object) => Promise<TX>
	decreaseAllowance: (spender: address, subtractedValue: uint, options: Object) => Promise<TX>
}