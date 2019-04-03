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
		const walletFriendlyAcceptClick = this.props.walletFieldUpdate
		const walletFriendlyCancel = this.props.walletFieldUpdate
		const walletFriendlyEditorTextChanged = this.props.walletFieldUpdate
		const walletFriendlySuccess = this.props.walletFieldUpdate
		const walletPencilClick = this.props.walletFieldUpdate
		const walletPencilHover = this.props.walletPencilHover
		const layoutActions: LayoutFrameActionsOnly = { walletFieldUpdate, walletFriendlyAcceptClick, walletFriendlyCancel, walletFriendlyEditorTextChanged, walletFriendlySuccess, walletPencilClick, walletPencilHover }
		//actions and layoutFrameProps
		const layoutPage: LayoutFrameProps = {
			walletAddress: layoutProps.walletAddress,
			friendly: layoutProps.friendly,
			daiBalance: layoutProps.daiBalance,
			weiDaiBalance: layoutProps.weiDaiBalance,
			incubatingWeiDai: layoutProps.incubatingWeiDai,
			friendlyTextField: layoutProps.friendlyTextField,
			submittingFriendly: layoutProps.submittingFriendly,
			hovering: layoutProps.hovering,
			walletFieldUpdate: layoutActions.walletFieldUpdate,
			walletFriendlyAcceptClick: layoutActions.walletFriendlyAcceptClick,
			walletFriendlyCancel: layoutActions.walletFriendlyCancel,
			walletFriendlyEditorTextChanged: layoutActions.walletFriendlyEditorTextChanged,
			walletFriendlySuccess: layoutActions.walletFriendlySuccess,
			walletPencilClick: layoutActions.walletPencilClick,
			walletPencilHover: layoutActions.walletPencilHover
		};
		return layoutPage;
	}

}



export { AppPresentationComponent };
