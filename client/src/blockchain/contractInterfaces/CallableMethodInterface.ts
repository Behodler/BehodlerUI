import { address } from './SolidityTypes'
export interface callOptions {
	from: address
}
export interface call<T> {
	(options?: any): Promise<T>
}