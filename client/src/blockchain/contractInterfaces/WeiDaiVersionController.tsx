import { uint, address, Bytes16 } from "./SolidityTypes";
import { Secondary } from './Secondary';
import { BaseContract } from './BaseContract';

export interface WeiDaiVersionController extends Secondary, BaseContract {
	setContractGroup: (v: uint, weiDai: address, dai: address, pre: address, bank: address, name: Bytes16, enabled: boolean) => any
	getWeiDai: (v: uint) => any
	getDai: (v: uint) => any
	getPRE: (v: uint) => any
	getWeiDaiBank: (v: uint) => any
	getContractFamilyName: (v: uint) => any
	renameContractFamily: (v: uint, name: Bytes16) => any
	setEnabled: (v: uint, enabled: boolean) => any
	isEnabled: (v: uint) => any
	setActiveVersion: (v: uint) => any
	getUserActiveVersion: (user: address) => any
	setDefaultVersion: (v: uint) => any
	getDefaultVersion:()=>any
	getContractVersion: (contract: address) => any
}