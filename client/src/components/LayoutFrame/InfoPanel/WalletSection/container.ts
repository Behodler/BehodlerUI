import * as actions from './actions'
import * as constants from './constants'
import { WalletPropsOnly } from './index'
import { IWalletStore } from './store'

export function mapStateToProps(state: IWalletStore): WalletPropsOnly {
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
	walletFriendlyAcceptClick: () => dispatch(actions.walletFriendlyEditorAcceptClick()),
	walletFriendlySuccess: () => dispatch(actions.walletFriendlyEditorAcceptSuccess()),
	walletFriendlyCancel: () => dispatch(actions.walletFriendlyEditorCancel()),
	walletFriendlyEditorTextChanged: (newText: string) => dispatch(actions.walletFriendlyEditorTextChanged(newText)),
	walletPencilClick: () =>  dispatch(actions.walletFriendlyPencilClick()),
	walletFieldUpdate: (fieldName: constants.WalletFieldNames, text: string) => dispatch(actions.walletFieldUpdate(fieldName, text))
})

