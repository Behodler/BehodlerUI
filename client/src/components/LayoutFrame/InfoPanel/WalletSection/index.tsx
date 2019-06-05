import * as React from 'react'
import { useState, useEffect } from 'react'
import { Grid, withStyles, List, ListItem, IconButton } from '@material-ui/core';
import { themedText } from '../Common'
import Edit from '@material-ui/icons/Edit'
import FormDialog from '../../../Common/FormDialog'
import API from '../../../../blockchain/ethereumAPI'
import * as storage from '../../../../util/HTML5'
import { truncate } from '../../../../util/jsHelpers'


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

function WalletSectionComponent(props: any) {
	const classes = props.classes
	const [walletAddress, setWalletAddress] = useState<string>("0x0")
	const [weiDaiBalance, setWeiDaiBalance] = useState<string>("unset")
	const [daiBalance, setDaiBalance] = useState<string>("unset")
	const [incubatingWeiDai, setIncubatingWeiDai] = useState<string>("unset")
	const [editingFriendly, setEditingFriendly] = useState<boolean>(false)
	const [friendlyText, setFriendlyText] = useState<string>(storage.loadFriendlyName(walletAddress))

	useEffect(() => {
		const subscription = API.accountObservable.subscribe(account => {
			if (walletAddress !== account)
				setFriendlyText(storage.loadFriendlyName(account))
			setWalletAddress(account)
		})

		return function () {
			subscription.unsubscribe()
		}
	})

	useEffect(() => {
		const effect = API.weiDaiEffects.balanceOfEffect(walletAddress)
		const subscription = effect.Observable.subscribe((balance) => {
			setWeiDaiBalance(balance)
		})

		return function () {
			effect.cleanup()
			subscription.unsubscribe()
		}
	})

	useEffect(() => {
		const effect = API.daiEffects.balanceOfEffect(walletAddress)
		const subscription = effect.Observable.subscribe((balance) => {
			setDaiBalance(balance)
		})

		return function () {
			effect.cleanup()
			subscription.unsubscribe()
		}
	})

	useEffect(() => {
		const effect = API.preEffects.incubatingWeiDaiEffect(walletAddress)
		const subscription = effect.Observable.subscribe((balance) => {
			setIncubatingWeiDai(balance)
		})

		return function () {
			effect.cleanup()
			subscription.unsubscribe()
		}
	})

	const updateFriendly = () => {
		if (friendlyText.length == 0)
			return
		storage.setFriendlyName(walletAddress, friendlyText)
		setEditingFriendly(false)
	}


	return (
		<div>
			<FormDialog
				fieldNames={['Friendly Name']}
				submit={updateFriendly}
				close={() => setEditingFriendly(false)}
				fieldUpdate={[setFriendlyText]}
				validationErrors={[]}
				message='stored locally only'
				title='Set Friendly Name for Account'
				isOpen={editingFriendly}
				fieldText={[friendlyText]}
			></FormDialog>
			{getList(classes, walletAddress, storage.loadFriendlyName(walletAddress), daiBalance, weiDaiBalance, incubatingWeiDai, setEditingFriendly)}
		</div>
	)
}

function getList(classes: any, walletAddress: string, friendly: string, daiBalance: string, weiDaiBalance: string, incubatingWeiDai: string, pencilClick: (editing: boolean) => void) {
	return (
		<List>
			<ListItem>
				{getLine(classes, "Wallet Address", `${truncate(walletAddress)}`)}
			</ListItem>
			<ListItem>
				{getLine(classes, "Friendly", friendly, false, <IconButton onClick={() => pencilClick(true)} className={classes.button}><Edit fontSize="small" /></IconButton>)}
			</ListItem>
			<ListItem>
				{getLine(classes, "Dai Balance", daiBalance)}
			</ListItem>
			<ListItem>
				{getLine(classes, "WeiDai Balance", weiDaiBalance)}
			</ListItem>
			<ListItem>
				{getLine(classes, "Incubating WeiDai", incubatingWeiDai)}
			</ListItem>
		</List>
	)
}


function getLine(classes: any, label: string, detail: number | string, percentage: boolean = false, icon: any | undefined = undefined) {
	const paragraph = themedText(classes)
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