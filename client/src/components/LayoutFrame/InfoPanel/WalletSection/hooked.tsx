import * as React from 'react'
import { useState, useEffect } from 'react'
import { Grid, withStyles, List, ListItem, IconButton } from '@material-ui/core';
import { themedText } from '../Common'
import Edit from '@material-ui/icons/Edit'
// import * as constants from './constants'
import FormDialog from '../../../Common/FormDialog'
import API from '../../../../blockchain/ethereumAPI'
// import * as storage from '../../../../util/HTML5'


export interface WalletProps {
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

function WalletSectionComponent(props: WalletProps) {
	const [walletAddress, setWalletAddress] = useState<string>("0x0")
	useEffect(()=>{
		const subscription = API.accountObservable.subscribe(account=>{
			setWalletAddress(account)
		})

		return function(){
			subscription.unsubscribe()
		}
	})
	return (
		<div>
			<FormDialog
				fieldNames={['Friendly Name']}
				submit={()=>alert('place holder for walletFriendlyAcceptClick')}
				close={()=>alert('place holder for walletFriendlyCancel')}
				fieldUpdate={[()=>alert('place holder for walletFriendlyEditorTextChanged')]}
				validationErrors={[]}
				message='stored locally only'
				title='Set Friendly Name for Account'
				isOpen={props.editingFriendly}
				fieldText={[props.friendlyTextField]}
			></FormDialog>
			{getList(props,walletAddress)}
		</div>
	)
}

function getList(props: WalletProps,walletAddress:string) {
	const { classes } = props
	return (
		<List>
			<ListItem>
				{getLine(props, "Wallet Address", `${walletAddress}`)}
			</ListItem>
			<ListItem>

				{getLine(props, "Friendly", props.friendly, false, <IconButton onClick={()=>alert('place holder for walletPencilClick')} className={classes.button}><Edit fontSize="small" /></IconButton>)}

			</ListItem>
			<ListItem>
				{getLine(props, "Dai Balance", props.daiBalance)}
			</ListItem>
			<ListItem>
				{getLine(props, "WeiDai Balance", props.weiDaiBalance)}
			</ListItem>
			<ListItem>
				{getLine(props, "Incubating WeiDai", props.incubatingWeiDai)}
			</ListItem>
		</List>
	)
}


function getLine(props: WalletProps, label: string, detail: number | string, percentage: boolean = false, icon: any | undefined = undefined) {
	const paragraph = themedText(props.classes)
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

export const WalletSection = withStyles(textStyle)(WalletSectionComponent)