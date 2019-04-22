import * as actions from './actions'
import { LayoutFramePropsOnly } from './index'
import { LayoutStore } from './store'
import { bindActionCreators } from 'redux';

export function mapStateToProps(state: LayoutStore): LayoutFramePropsOnly {
	const { metaMaskEnabled, metamaskConnected, connectingAccount } = state
	return {
		metaMaskEnabled,
		metamaskConnected,
		connectingAccount
	}
}

export const mapDispatchToProps = (dispatch: any) => bindActionCreators({
	connectToMetamask: () =>  dispatch(actions.connectToMetamask()),
	setMetaMaskConnected: (connected: boolean) => dispatch(actions.setMetamaskConnected(connected)),
	setMetaMaskEnabled: (enabled: boolean) => dispatch(actions.setMetamaskEnabled(enabled)),
},dispatch)

