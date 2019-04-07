import * as constants from './constants'
import { Action } from 'redux';

export interface IConnectToMetaMask extends Action {
	type: constants.CONNECT_TO_METAMASK;
}

export interface ISetMetamaskEnabled extends Action {
	type: constants.SET_METAMASK_ENABLED
	payload: {
		enabled: boolean
	}
}


export interface ISetMetamaskConnected extends Action {
	type: constants.SET_METAMASK_CONNECTED
	payload: {
		connected: boolean
	}
}

export type LayoutAction = IConnectToMetaMask | ISetMetamaskConnected | ISetMetamaskEnabled

export function connectToMetamask(): IConnectToMetaMask {
	return {
		type: constants.CONNECT_TO_METAMASK
	}
}

export function setMetamaskEnabled(enabled: boolean): ISetMetamaskEnabled {
	return {
		type: constants.SET_METAMASK_ENABLED,
		payload: { enabled }
	}
}

export function setMetamaskConnected(connected: boolean): ISetMetamaskConnected {
	return {
		type: constants.SET_METAMASK_CONNECTED,
		payload: { connected }
	}
}