import { address } from './SolidityTypes'

export interface Ownable {
	owner: () => any
	transferOwnership: (newOwner: address) =>any
}