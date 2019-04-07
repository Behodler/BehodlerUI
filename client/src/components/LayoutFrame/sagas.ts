import * as actions from './actions';
import * as constants from './constants'
import { LayoutStore } from './store'
import sections from '../../redux/sections'
import { takeLatest, select, put, call } from 'redux-saga/effects';
import API from '../../blockchain/ethereumAPI'

export const getState = (state: any) => state;

function* connectToMetaMask() {
	const state: LayoutStore = (yield select(getState))[sections.layoutSection]
	if (!state.connectingAccount)
		return

	if (!state.metaMaskEnabled || !state.metamaskConnected) {
		yield call(() => API.connectMetaMask())
		yield put(actions.setMetamaskEnabled(API.isMetaMaskEnabled()))
		yield put(actions.setMetamaskConnected(API.isMetaMaskConnected()))
	}
}

export function* layoutRoot() {
	yield takeLatest<actions.LayoutAction>(constants.CONNECT_TO_METAMASK, connectToMetaMask)
}
