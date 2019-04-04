import { Reducer } from 'redux';
import { IWalletStore, initialState } from './store'
import * as actions from './actions'
import * as constants from './constants'


export const walletReducer: Reducer<IWalletStore, actions.WalletAction> = (state: IWalletStore, action: actions.WalletAction): IWalletStore => {
	console.log("wallet reducer called: " + JSON.stringify(action, null, 4))
	switch (action.type) {
		case constants.WALLET_FRIENDLY_EDITOR_ACCEPT_CLICK:
			return { ...state, submittingFriendly: true }
		case constants.WALLET_FRIENDLY_EDITOR_ACCEPT_SUCCESS:
			return { ...state, submittingFriendly: false, editingFriendly: false }
		case constants.WALLET_FRIENDLY_EDITOR_CANCEL:
			return { ...state, submittingFriendly: false, editingFriendly: false }
		case constants.WALLET_FRIENDLY_EDITOR_TEXTCHANGED:
			const text = isValidText(action.payload.newText) ? action.payload.newText
				: state.friendlyTextField;
			return { ...state, friendlyTextField: text }
		case constants.WALLET_FRIENDLY_PENCIL_CLICK:
			console.log("pencil clicked")
			return { ...state, editingFriendly: true }
		case constants.WALLET_FIELD_UPDATE:
			let newState = { ...state }
			newState[action.payload.fieldName] = action.payload.newText
			return newState
		default:
			return initialState
	}
}

const isValidText = (text: string | undefined): boolean =>
	!!text && text.length < 15