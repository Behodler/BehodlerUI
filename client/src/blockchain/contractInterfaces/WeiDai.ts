import { Secondary } from './Secondary'
import { ERC20 } from './ERC20'
import {address, uint } from './SolidityTypes'
import { BaseContract } from './BaseContract';

export interface WeiDai extends BaseContract, Secondary, ERC20 {
	name: () => any
	symbol: () => any
	decimals: () => any

	setBank: (bank: address, authorize: boolean) => any
	issue: (recipient: address, value: uint) => any
	burn: (from: address, value: uint) => any
}