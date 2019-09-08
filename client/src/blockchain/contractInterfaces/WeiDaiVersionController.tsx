import { uint, address, Bytes16 } from "./SolidityTypes";
import { Secondary } from './Secondary';
import { BaseContract } from './BaseContract';

export interface WeiDaiVersionController extends Secondary, BaseContract {
	setContractGroup: (version: uint, weiDai: address, dai: address, pre: address, bank: address, name: Bytes16) => any
	getWeiDai: (version: uint) => any
	getDai: (version: uint) => any
	getPRE: (version: uint) => any
	getWeiDaiBank: (version: uint) => any
	getContractFamilyName: (version: uint) => any
	renameContractFamily: (version: uint, name: Bytes16) => any
	setEnabled: (version: uint, enabled: boolean) => any
	isEnabled: (version: uint) => any
	setActiveVersion: (version: uint) => any
	getUserActiveVersion: (user: address) => any
	setDefaultVersion: (version: uint) => any
	getDefaultVersion:()=>any
	getContractVersion: (contract: address) => any
}