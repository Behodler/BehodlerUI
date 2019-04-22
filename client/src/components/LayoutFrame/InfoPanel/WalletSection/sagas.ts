import * as actions from './actions';
import * as constants from './constants'
import { IWalletStore } from './store'
import sections from '../../../../redux/sections'
import { select, put,takeLeading } from 'redux-saga/effects';
import { setFriendlyName } from '../../../../util/HTML5'

export const getState = (state: any) => state;

function* setFriendly() {
	const state: IWalletStore = (yield select(getState))[sections.walletSection]
	if (state.friendlyTextField && state.friendlyTextField.length > 0 && state.friendly.length > 0 && state.address.length > 0) {
		setFriendlyName(state.address, state.friendly)
		yield put(actions.walletFriendlyEditorAcceptSuccess());
	}
}

export function* walletRoot() {
	yield takeLeading<actions.WalletAction>(constants.WALLET_FRIENDLY_EDITOR_ACCEPT_CLICK, setFriendly)
}



