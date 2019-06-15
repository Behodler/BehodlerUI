import * as React from 'react'
import { useState, useEffect } from 'react'
import { Grid, withStyles, List, ListItem, IconButton } from '@material-ui/core';
import { themedText } from './Common'
import Edit from '@material-ui/icons/Edit'
import FormDialog from '../../Common/FormDialog'
import API from '../../../blockchain/ethereumAPI'
import * as storage from '../../../util/HTML5'
import { truncate } from '../../../util/jsHelpers'
import {DetailProps} from './Detail'
import {ClickAbleInfoListItem} from './Common'

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

export interface WalletProps {
	setDetailProps: (props: DetailProps) => void
	setDetailVisibility: (visible:boolean) =>void
	classes?: any
}

function WalletSectionComponent(props: WalletProps) {
	const classes = props.classes
	const [walletAddress, setWalletAddress] = useState<string>("0x0")
	const [weiDaiBalance, setWeiDaiBalance] = useState<string>("unset")
	const [daiBalance, setDaiBalance] = useState<string>("unset")
	const [incubatingWeiDai, setIncubatingWeiDai] = useState<string>("unset")
	const [editingFriendly, setEditingFriendly] = useState<boolean>(false)
	const [friendlyText, setFriendlyText] = useState<string>(storage.loadFriendlyName(walletAddress))
	const [currentPenalty, setCurrentPenalty] = useState<string>("0")
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

	useEffect(() => {
		const effect = API.preEffects.calculateCurrentPenaltyForHolder(walletAddress)
		const subscription = effect.Observable.subscribe((penalty) => {
			setCurrentPenalty(penalty)
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
			{getList(classes,props.setDetailProps,props.setDetailVisibility, walletAddress, storage.loadFriendlyName(walletAddress), daiBalance, weiDaiBalance, incubatingWeiDai,currentPenalty, setEditingFriendly)}
		</div>
	)
}

function getList(classes: any,setDetailProps:(props:DetailProps)=>void,setDetailVisibility:(props:boolean)=>void, walletAddress: string, friendly: string, daiBalance: string, weiDaiBalance: string, incubatingWeiDai: string,currentPenalty:string, pencilClick: (editing: boolean) => void) {
	return (
		<List>
			<ListItem button>
				{getLine(classes, "Wallet Address", `${truncate(walletAddress)}`)}
			</ListItem>
			<ListItem button>
				{getLine(classes, "Friendly", friendly, false, <IconButton onClick={() => pencilClick(true)} className={classes.button}><Edit fontSize="small" /></IconButton>)}
			</ListItem>
			<ClickAbleInfoListItem details={daiBalanceDetails} setDetailProps = {setDetailProps} setDetailVisibility={setDetailVisibility}>
				{getLine(classes, "Dai Balance", daiBalance)}
			</ClickAbleInfoListItem>
			<ClickAbleInfoListItem details={weiDaiBalanceDetails} setDetailProps = {setDetailProps} setDetailVisibility={setDetailVisibility}>
				{getLine(classes, "WeiDai Balance", weiDaiBalance)}
			</ClickAbleInfoListItem>
			<ClickAbleInfoListItem details={incubatingWeiDaiDetails} setDetailProps = {setDetailProps} setDetailVisibility={setDetailVisibility}>
				{getLine(classes, "Incubating WeiDai", incubatingWeiDai)}
			</ClickAbleInfoListItem>
			{parseInt(currentPenalty)>-1?
			<ClickAbleInfoListItem details={currentPenaltyDetails} setDetailProps = {setDetailProps} setDetailVisibility={setDetailVisibility}>
				{getLine(classes, "Current Penalty", currentPenalty+'%')}
			</ClickAbleInfoListItem>:""
			}
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

const daiBalanceDetails: DetailProps = {
	header: "DAI BALANCE",
	content: "TO CREATE WEIDAI, YOU NEED TO FIRST OWN SOME DAI, AN ERC20 TOKEN KNOWN AS A STABLECOIN BECAUSE IT TRACKS THE US DOLLAR. UNLIKE EARLY RENDITIONS OF STABLE COINS, DAI IS MANAGED ENTIRELY ON THE ETHEREUM BLOCKCHAIN BY THE MAKERDAO AND IS 100% DECENTRALIZED, INHERITING THE CENSORSHIP RESISTANCE OF ETHEREUM TRANSACTIONS.",
	linkText: "Learn more", 
	linkURL: "https://medium.com/"
}

const weiDaiBalanceDetails: DetailProps = {
	header: "WEIDAI BALANCE",
	content: "WEIDAI IS THE WORLD'S FIRST THRIFTCOIN, A STABLECOIN DESIGNED TO INCREASE IN VALUE WHILE RETAINING PRICE STABILITY. WEIDAI IS REDEEMABLE FOR DAI ACCORDING TO A GLOBAL REDEEM RATE. WHENEVER CIRCULATING WEIDAI IS BURNT, THE REDEEM RATE INCREASES. TWO MECHANISMS EXIST TO ENCOURAGE REGULAR BURNING SO THAT THE REDEEM RATE REGULARLY INCREASES. THE REDEEM RATE CAN NEVER FALL.",
	linkText: "Learn more", 
	linkURL: "https://medium.com/"
}

const incubatingWeiDaiDetails: DetailProps = {
	header: "INCUBATING WEIDAI",
	content: "TO CREATE WEIDAI, YOU SEND YOUR DAI TO THE PATIENCE REGULATION ENGINE, AN ETHEREUM SMART CONTRACT THAT INCUBATES YOUR DAI UNTIL IT BECOMES WEIDAI. IF YOU PREMATURELY ATTEMPT TO WITHDRAW YOUR INCUBATING WEIDAI, IT WILL BE SLASHED WITH A PENALTY. ONCE THE WEIDAI HAS INCUBATED ENTIRELY, YOU HAVE TO WITHDRAW IT FROM THE PATIENCE REGULATION ENGINE TO USE IT. EACH ETHEREUM ADDRESS CAN ONLY INCUBATE ONE BATCH OF WEIDAI AT A TIME.",
	linkText: "Learn more", 
	linkURL: "https://medium.com/"
}

const currentPenaltyDetails:DetailProps = {
	header: "PENALTY ON EARLY WITHDRAWAL",
	content:"CURRENT PENALTY, EXPRESSED AS A PERCENTAGE IS A TAX YOU WILL INCUR IF YOU WITHDRAW YOUR INCUBATING WEIDAI BEFORE IT HAS FINISHED INCUBATING. YOU SHOULD ONLY SEE THIS STAT IF YOU CURRENTLY HAVE INCUBATING WEIDAI. THE PENALTY DECLINES OVER TIME IN STEPS OF 5 PERCENTAGE POINTS. THE RATE AT WHICH IT DECLINES IS MEASURED IN BLOCKS AND LISTED BELOW UNDER THE STAT 'PENALTY REDUCTION PERIOD'. THE PENALTY REDUCTION PERIOD DYNAMICALLY ADJUSTS REGULARLY, RISING IF MOST PURCHASERS MANAGE TO WAIT OUT THE INCUBATION DURING AN EPOCH AND FALLING IF MOST USERS DO NOT MANAGE TO WAIT. WHEN YOU PURCHASE WEIDAI, THE PENALTY REDUCTION PERIOD YOU EXPERIENCE IS FIXED FOR THE DURATION OF THE INCUBATION. THE EASIEST ANALOGY FOR THE PENALTY REDUCTION PERIOD IS MINING DIFFICULTY IN PROOF OF WORK COINS LIKE BITCOIN, EXCEPT THAT INSTEAD OF THE WORK COMING FROM MINING POWER, IT COMES FROM YOUR VERY PATIENCE.",
	linkText:"Learn more",
	linkURL:'http://medium.com'
}

export const WalletSection = withStyles(textStyle)(WalletSectionComponent)