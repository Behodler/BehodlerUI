import { Reducer } from 'redux';
import { LayoutStore, initialState } from './store'
import * as actions from './actions'
import * as constants from './constants'

export const layoutReducer: Reducer<LayoutStore, actions.LayoutAction> = (state: LayoutStore, action: actions.LayoutAction): LayoutStore => {
	switch (action.type) {
		case constants.CONNECT_TO_METAMASK:
			return { ...state, connectingAccount: true }
		case constants.SET_METAMASK_ENABLED:
			const connected = action.payload.enabled ? state.metamaskConnected : false//consistent state
			return { ...state, metaMaskEnabled: action.payload.enabled, connectingAccount: false, metamaskConnected: connected }
		case constants.SET_METAMASK_CONNECTED:
			const enabled = action.payload.connected ? true : state.metaMaskEnabled
			return { ...state, metamaskConnected: action.payload.connected, connectingAccount: false, metaMaskEnabled: enabled }
		default:
			return initialState
	}
}