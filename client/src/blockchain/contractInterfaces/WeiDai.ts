import { Secondary } from './Secondary'
import { ERC20 } from './ERC20'
import { TX, address, uint } from './SolidityTypes'
import { call } from './CallableMethodInterface'

export interface WeiDai extends Secondary, ERC20 {
	name: () => call<string>
	symbol: () => call<string>
	decimals: () => call<uint>

	setBank: (bank: address, authorize: boolean, options: Object) => Promise<TX>
	issue: (recipient: address, value: uint, options: Object) => Promise<TX>
	burn: (from: address, value: uint, options: Object) => Promise<TX>

}