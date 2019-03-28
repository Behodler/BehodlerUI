import { Reducer } from 'redux';
import { IWalletStore, initialState } from './store'
import * as actions from './actions'
import * as constants from './constants'


export const walletReducer: Reducer<IWalletStore, actions.WalletAction> = (state: IWalletStore, action: actions.WalletAction): IWalletStore => {
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
		case constants.WALLET_FRIENDLY_HOVER:
			return { ...state, hovering: action.payload.onHover }
		case constants.WALLET_FRIENDLY_PENCIL_CLICK:
			return { ...state, editingFriendly: true }
		default:
			return initialState
	}
}

const isValidText = (text: string | undefined): boolean =>
	!!text && text.length < 15