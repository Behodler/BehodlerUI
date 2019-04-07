import * as React from 'react'
import { Grid, withStyles, List, ListItem, IconButton } from '@material-ui/core';
import { themedText } from '../Common'
import Edit from '@material-ui/icons/Edit'
import * as constants from './constants'
import FormDialog from '../../../Common/FormDialog'
import sections from 'src/redux/sections';

export interface WalletPropsOnly {
	walletAddress: string
	friendly: string
	daiBalance: number
	weiDaiBalance: number
	incubatingWeiDai: number
	friendlyTextField: string
	submittingFriendly: boolean
	editingFriendly: boolean
	classes?: any
}

export interface WalletActionsOnly {
	walletFriendlyAcceptClick: () => void
	walletFriendlySuccess: () => void
	walletFriendlyCancel: () => void
	walletFriendlyEditorTextChanged: (newText: string) => void
	walletPencilClick: () => void
	walletFieldUpdate: (fieldName: constants.WalletFieldNames, text: string) => void
}

export interface WalletProps extends WalletPropsOnly, WalletActionsOnly {

}

export const populateWalletProps = (props:any):WalletProps=>{
	const walletPropsOnly = props[sections.walletSection] as WalletPropsOnly
	const walletFieldUpdate = props.walletFieldUpdate
	const walletFriendlyAcceptClick = props.walletFriendlyAcceptClick
	const walletFriendlyCancel = props.walletFriendlyCancel
	const walletFriendlyEditorTextChanged = props.walletFriendlyEditorTextChanged
	const walletFriendlySuccess = props.walletFriendlySuccess
	const walletPencilClick = props.walletPencilClick
	const walletActions: WalletActionsOnly = { walletFieldUpdate, walletFriendlyAcceptClick, walletFriendlyCancel, walletFriendlyEditorTextChanged, walletFriendlySuccess, walletPencilClick }

	const walletProps:WalletProps = {
		...walletPropsOnly,
		...walletActions
	}
	return walletProps
}

const textStyle = (theme: any) => ({
	text: {
		fontSize: 12,
		fontFamily: "Syncopate",
		margin: "0 0 0 0",
	},
	button: {
		paddingTop: 0,
		paddingBottom: 0
	}
})

export class WalletSectionComponent extends React.Component<WalletProps, any>{

	render() {
		return (
			<div>
				<FormDialog
					fieldNames={['Friendly Name']}
					submit={this.props.walletFriendlyAcceptClick}
					close={this.props.walletFriendlyCancel}
					fieldUpdate={[this.props.walletFriendlyEditorTextChanged]}
					validationErrors={[]}
					message='stored locally only'
					title='Set Friendly Name for Account'
					isOpen={this.props.editingFriendly}
					fieldText={[this.props.friendlyTextField]}
				></FormDialog>
				{this.getList()}
			</div>
		)
	}

	getList() {
		const { classes } = this.props
		return (
			<List>
				<ListItem>
					{this.getLine("Wallet Address", `${this.props.walletAddress}`)}
				</ListItem>
				<ListItem>

					{this.getLine("Friendly", this.props.friendly, false, <IconButton onClick={this.props.walletPencilClick} className={classes.button}><Edit fontSize="small" /></IconButton>)}

				</ListItem>
				<ListItem>
					{this.getLine("Dai Balance", this.props.daiBalance)}
				</ListItem>
				<ListItem>
					{this.getLine("WeiDai Balance", this.props.weiDaiBalance)}
				</ListItem>
				<ListItem>
					{this.getLine("Incubating WeiDai", this.props.incubatingWeiDai)}
				</ListItem>
			</List>
		)
	}

	getLine(label: string, detail: number | string, percentage: boolean = false, icon: any | undefined = undefined) {
		const paragraph = themedText(this.props.classes)
		return (
			<Grid
				container
				direction="row"
				justify="space-between"
				alignItems="center"
			>
				<Grid item>
					{paragraph(label)}
				</Grid>
				<Grid item>
					{paragraph(detail, percentage, icon)}
				</Grid>
			</Grid>
		)
	}
}


export const WalletSection = withStyles(textStyle)(WalletSectionComponent)