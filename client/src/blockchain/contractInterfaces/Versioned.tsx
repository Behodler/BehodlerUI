import { address } from "./SolidityTypes";
import { Secondary } from './Secondary';
import { BaseContract } from './BaseContract';

export interface Versioned extends Secondary, BaseContract {
	setVersionController: (address: address) => any
}