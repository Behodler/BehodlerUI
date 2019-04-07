import { Secondary } from './Secondary'
import { ERC20 } from './ERC20'
import { TX, address, uint } from './SolidityTypes'


interface nameCall {
	call: () => Promise<string>
}

interface symbolCall {
	call: () => Promise<string>
}

interface decimalsCall {
	call: () => Promise<uint>
}

export interface WeiDai extends Secondary, ERC20 {
	name: nameCall
	symbol: symbolCall
	decimals: decimalsCall
	setBank: (bank: address, authorize: boolean, options: Object) => Promise<TX>
	issue: (recipient: address, value: uint, options: Object) => Promise<TX>
	burn: (from: address, value: uint, options: Object) => Promise<TX>

}