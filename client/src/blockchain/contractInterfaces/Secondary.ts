import { address, TX } from './SolidityTypes'

interface primaryCall {
	call: () => Promise<TX>
}

export interface Secondary {
	primary: primaryCall
	transferPrimary: (recipient: address, options: Object) => Promise<TX>
}