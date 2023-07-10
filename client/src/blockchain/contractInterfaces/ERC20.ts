import { uint, address } from './SolidityTypes'
import { BaseContract } from './BaseContract';

export interface ERC20 extends BaseContract {
	totalSupply: () => any
	balanceOf: (address: address) => any
	allowance: (owner: address, spender: address) => any
	transfer: (to: address, value: uint) => any
	approve: (spender: address, value: uint) => any
	transferFrom: (from: address, to: address, value: uint) => any
	increaseAllowance: (spender: address, addedValue: uint) => any
	decreaseAllowance: (spender: address, subtractedValue: uint) => any
	decimals: () => any
	symbol: () => any
	name: () => any
	lastMinted: (minter: address) => any
}