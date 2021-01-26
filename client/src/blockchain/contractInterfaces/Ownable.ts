import { address } from './SolidityTypes'
import {BaseContract} from './BaseContract'
export interface Ownable extends BaseContract {
	owner: () => any
	transferOwnership: (newOwner: address) =>any
}