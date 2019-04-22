import { Reducer } from 'redux';
import { IWalletStore, initialState } from './store'
import * as actions from './actions'
import * as constants from './constants'


export const walletReducer: Reducer<IWalletStore, actions.WalletAction> = (state: IWalletStore, action: actions.WalletAction): IWalletStore => {
	switch (action.type) {
		case constants.WALLET_FRIENDLY_EDITOR_ACCEPT_CLICK:
			if (!state.friendlyTextField || state.friendlyTextField.length === 0)
				return { ...state }
			return { ...state, submittingFriendly: true, friendly: state.friendlyTextField || "" }
		case constants.WALLET_FRIENDLY_EDITOR_ACCEPT_SUCCESS:
			return { ...state, submittingFriendly: false, editingFriendly: false }
		case constants.WALLET_FRIENDLY_EDITOR_CANCEL:
			return { ...state, submittingFriendly: false, editingFriendly: false }
		case constants.WALLET_FRIENDLY_EDITOR_TEXTCHANGED:
			const text = isValidText(action.payload.newText) ? action.payload.newText
				: state.friendlyTextField;
			return { ...state, friendlyTextField: text }
		case constants.WALLET_FRIENDLY_PENCIL_CLICK:
			return { ...state, editingFriendly: true, friendlyTextField: state.friendly }
		case constants.WALLET_FIELD_UPDATE:
			return { ...state, [action.payload.fieldName]: action.payload.newText }
		default:
			return initialState
	}
}

const isValidText = (text: string): boolean =>
	text.length < 15