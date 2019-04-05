import * as React from 'react';
import './App.css';
import { LayoutFrameProps } from './components/LayoutFrame/index'
import sections from './redux/sections'
import { LayoutFrame, LayoutFramePropsOnly, LayoutFrameActionsOnly } from './components/LayoutFrame/index'
class AppPresentationComponent extends React.Component<any, any> {
	public render() {
		return (
			<div>
				<LayoutFrame {...this.getLayoutFrameProps()} />
			</div>
		);
	}

	private getLayoutFrameProps(): LayoutFrameProps {

		const layoutProps: LayoutFramePropsOnly = this.props[sections.walletSection] as LayoutFramePropsOnly;
		const walletFieldUpdate = this.props.walletFieldUpdate
		const walletFriendlyAcceptClick = this.props.walletFriendlyAcceptClick
		const walletFriendlyCancel = this.props.walletFriendlyCancel
		const walletFriendlyEditorTextChanged = this.props.walletFriendlyEditorTextChanged
		const walletFriendlySuccess = this.props.walletFriendlySuccess
		const walletPencilClick = this.props.walletPencilClick
		const layoutActions: LayoutFrameActionsOnly = { walletFieldUpdate, walletFriendlyAcceptClick, walletFriendlyCancel, walletFriendlyEditorTextChanged, walletFriendlySuccess, walletPencilClick }
		//actions and layoutFrameProps
		const layoutPage: LayoutFrameProps = {
			walletAddress: layoutProps.walletAddress,
			friendly: layoutProps.friendly,
			daiBalance: layoutProps.daiBalance,
			weiDaiBalance: layoutProps.weiDaiBalance,
			incubatingWeiDai: layoutProps.incubatingWeiDai,
			friendlyTextField: layoutProps.friendlyTextField,
			submittingFriendly: layoutProps.submittingFriendly,
			editingFriendly: layoutProps.editingFriendly,
			walletFieldUpdate: layoutActions.walletFieldUpdate,
			walletFriendlyAcceptClick: layoutActions.walletFriendlyAcceptClick,
			walletFriendlyCancel: layoutActions.walletFriendlyCancel,
			walletFriendlyEditorTextChanged: layoutActions.walletFriendlyEditorTextChanged,
			walletFriendlySuccess: layoutActions.walletFriendlySuccess,
			walletPencilClick: layoutActions.walletPencilClick
		};
		return layoutPage;
	}

}



export { AppPresentationComponent };
