import { address } from './SolidityTypes'

export interface Secondary {
	primary: () => any
	transferPrimary: (recipient: address) =>any
}