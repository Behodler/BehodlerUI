import * as constants from './constants'
import { Action } from 'redux';

export interface IWalletFriendlyPencilClick extends Action {
	type: constants.WALLET_FRIENDLY_PENCIL_CLICK;
}

export interface IWalletFriendlyEditorTextChanged extends Action {
	type: constants.WALLET_FRIENDLY_EDITOR_TEXTCHANGED;
	payload: {
		newText: string
	}
}

export interface IWalletFieldUpdate extends Action {
	type: constants.WALLET_FIELD_UPDATE;
	payload: {
		fieldName: constants.WalletFieldNames
		newText: string
	}
}

export interface IWalletFriendlyEditorCancel extends Action {
	type: constants.WALLET_FRIENDLY_EDITOR_CANCEL;
}

export interface IWalletFriendlyEditorAcceptClick extends Action {
	type: constants.WALLET_FRIENDLY_EDITOR_ACCEPT_CLICK;
}

export interface IWalletFriendlyEditorAcceptSuccess extends Action {
	type: constants.WALLET_FRIENDLY_EDITOR_ACCEPT_SUCCESS;
}


export type WalletAction = IWalletFriendlyPencilClick |
	IWalletFriendlyEditorAcceptClick | IWalletFriendlyEditorAcceptSuccess | IWalletFriendlyEditorCancel
	| IWalletFriendlyEditorTextChanged | IWalletFieldUpdate;


export function walletFieldUpdate(fieldName: constants.WalletFieldNames, newText: string): IWalletFieldUpdate { //TODO: determine if this is necessary
	return {
		type: constants.WALLET_FIELD_UPDATE,
		payload: {
			fieldName,
			newText
		}
	}
}

export function walletFriendlyPencilClick(): IWalletFriendlyPencilClick {
	return {
		type: constants.WALLET_FRIENDLY_PENCIL_CLICK
	}
}

export function walletFriendlyEditorTextChanged(newText: string): IWalletFriendlyEditorTextChanged {
	return {
		type: constants.WALLET_FRIENDLY_EDITOR_TEXTCHANGED,
		payload: {
			newText
		}
	}
}

export function walletFriendlyEditorCancel(): IWalletFriendlyEditorCancel {
	return {
		type: constants.WALLET_FRIENDLY_EDITOR_CANCEL
	}
}

export function walletFriendlyEditorAcceptClick(): IWalletFriendlyEditorAcceptClick {
	return {
		type: constants.WALLET_FRIENDLY_EDITOR_ACCEPT_CLICK
	}
}

export function walletFriendlyEditorAcceptSuccess(): IWalletFriendlyEditorAcceptSuccess {
	return {
		type: constants.WALLET_FRIENDLY_EDITOR_ACCEPT_SUCCESS
	}
}