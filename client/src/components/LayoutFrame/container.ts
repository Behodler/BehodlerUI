import * as walletActions from './InfoPanel/WalletSection/actions'
import * as walletConstants from './InfoPanel/WalletSection/constants'
import { LayoutFramePropsOnly } from './index'
import { LayoutStore } from './store'

export function mapStateToProps(state: LayoutStore): LayoutFramePropsOnly {
	const { friendly, friendlyTextField, submittingFriendly, address, daiBalance, weiDaiBalance, incubatingWeiDai, editingFriendly } = state
	return {
		walletAddress: address,
		friendly,
		daiBalance,
		weiDaiBalance,
		incubatingWeiDai,
		friendlyTextField: friendlyTextField || "",
		submittingFriendly,
		editingFriendly
	}
}

export const mapDispatchToProps = (dispatch: any, ownProps: any) => ({
	walletFriendlyAcceptClick: () => dispatch(walletActions.walletFriendlyEditorAcceptClick()),
	walletFriendlySuccess: () => dispatch(walletActions.walletFriendlyEditorAcceptSuccess()),
	walletFriendlyCancel: () => dispatch(walletActions.walletFriendlyEditorCancel()),
	walletFriendlyEditorTextChanged: (newText: string) => dispatch(walletActions.walletFriendlyEditorTextChanged(newText)),
	walletPencilClick: () =>  dispatch(walletActions.walletFriendlyPencilClick()),
	walletFieldUpdate: (fieldName: walletConstants.WalletFieldNames, text: string) => dispatch(walletActions.walletFieldUpdate(fieldName, text))
})

