import { address, TX } from './SolidityTypes'
import { call } from './CallableMethodInterface'

export interface Secondary {
	primary: () => call<address>
	transferPrimary: (recipient: address, options: Object) => Promise<TX>
}