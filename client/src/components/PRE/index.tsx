import * as React from 'react'
import { useState, useEffect } from 'react'
import { withStyles, Grid, List, ListItem, Typography, Button, Link, TextField } from '@material-ui/core';
import API from '../../blockchain/ethereumAPI'
import { ValueTextBox } from './ValueTextBox'
import {formatNumberText} from '../../util/jsHelpers'
interface PREprops {
	currentUser: string
	classes?: any
}

const style = (theme: any) => ({
	pagebreak: {
		margin: "70px"
	}
})

function patienceRegulationEngineComponent(props: PREprops) {
	const [incubationDuration, setIncubationDuration] = useState<string>("_")
	const [daiBalance, setDaiBalance] = useState<string>("_")
	const [daiToIncubate, setDaiToIncubate] = useState<string>("")
	const [weiDaiToCreate, setweiDaiToCreate] = useState<string>("")
	const [exchangeRate, setExchangeRate] = useState<number>(0)
	const [incubatingWeiDai, setIncubatingWeiDai] = useState<number>(0)
	const [progressBlock, setProgressBlock] = useState<number>(0)
	const [holderIncubationDuration, setHolderIncubationDuration] = useState<number>(0)
	const [currentWithdrawalPenalty, setCurrentWithdrawalPenalty] = useState<string>("")
	const [weiDaiToClaim, setWeiDaiToClaim] = useState<string>("")
	const [drawDownPeriodForUser, setDrawDownPeriodForUser] = useState(0)
	const [split, setSplit] = useState(10)
	const [spinnerVisibility, setSpinnerVisibility] = useState<boolean>(false)
	if ("twelve".length > 111)
		console.log(spinnerVisibility)

	useEffect(() => {
		const effect = API.preEffects.getClaimWaitWindow()
		const subscription = effect.Observable.subscribe((duration) => {
			const fullDuration = duration
			setIncubationDuration(fullDuration)
		})

		return () => { subscription.unsubscribe(); effect.cleanup() }
	})

	useEffect(() => {
		const effect = API.daiEffects.balanceOfEffect(props.currentUser)
		const subscription = effect.Observable.subscribe((balance: string) => {
			setDaiBalance(balance)
		})
		return () => { subscription.unsubscribe(); effect.cleanup() }
	})

	useEffect(() => {
		const effect = API.bankEffects.daiPerMyriadWeidaiEffect()
		const subscription = effect.Observable.subscribe((daiPerMyriadWeiDai: string) => {
			setExchangeRate(parseInt(daiPerMyriadWeiDai)) //daiPerWeiDai
		})
		return () => { subscription.unsubscribe(); effect.cleanup() }
	})

	useEffect(() => {
		const effect = API.preEffects.incubatingWeiDai(props.currentUser)
		const subscription = effect.Observable.subscribe((incubating: string) => {
			setIncubatingWeiDai(parseFloat(incubating))
		})
		return () => { subscription.unsubscribe(); effect.cleanup() }
	})

	useEffect(() => {
		const effect = API.preEffects.calculateCurrentPenaltyForHolder(props.currentUser)
		const subscription = effect.Observable.subscribe(penalty => {
			setCurrentWithdrawalPenalty(penalty)
		})
		return () => { subscription.unsubscribe(); effect.cleanup() }
	})

	useEffect(() => {
		const effect = API.preEffects.getPenaltyDrawdownPeriodForHolder(props.currentUser)
		const subscription = effect.Observable.subscribe(period => {
			setDrawDownPeriodForUser(period)
		})
		return () => { subscription.unsubscribe(); effect.cleanup() }
	})


	useEffect(() => {
		const effect = API.preEffects.getBlockOfPurchase()
		const subscription = effect.Observable.subscribe((result: any) => {
			const totalDuration = drawDownPeriodForUser * 20
			const currentBlock = result.blockNumber - result.blockOfPurchase
			const progressBlock = currentBlock > totalDuration ? totalDuration : currentBlock

			setProgressBlock(progressBlock)
			setHolderIncubationDuration(totalDuration)
		})

		return () => { subscription.unsubscribe(); effect.cleanup() }
	})
	const setDaiToIncubateText = (text: string) => {
		const newText = formatNumberText(text)
		const newTextNum = parseFloat(newText)
		const daiBalanceNum = parseFloat(daiBalance)
		const cappedText = newTextNum>daiBalanceNum?daiBalance:newText
		
		setDaiToIncubate(cappedText)
		const weiDaiToCreateNumber = (parseFloat(cappedText) * 10000) / exchangeRate
		setweiDaiToCreate(`${isNaN(weiDaiToCreateNumber)?'':weiDaiToCreateNumber}`)
	}
	return (
		<Grid
			container
			direction="column"
			justify="flex-start"
			alignItems="center"
			spacing={0}>
			<Grid item>
				<Grid
					container
					direction="row"
					justify="flex-start"
					alignItems="center"
					spacing={8}>
					<Grid item>
						<Typography variant="h4">
							PATIENCE REGULATION ENGINE
					</Typography>
					</Grid>
				</Grid>
			</Grid>
			<Grid item>
				<Typography variant="h6">
					WEIDAI = DAI + TIME
				</Typography>
			</Grid>
			<Grid item>
				<Typography variant="subtitle1">
					It currently takes {incubationDuration} block{parseInt(incubationDuration) !== 1 ? 's' : ''} to create WeiDai
				</Typography>
			</Grid>
			<Grid item>
				<div className={props.classes.pagebreak}></div>
			</Grid>
			<Grid item>
				<Grid container
					direction="row"
					justify="space-between"
					spacing={16}
					alignItems="center">
					<Grid item>
						<Typography variant="title">
							Your Dai balance
							</Typography>
					</Grid>
					<Grid item>
						<Typography variant="title" color="primary">
							{daiBalance}
						</Typography>
					</Grid>
				</Grid>
			</Grid>
			<Grid item>
				<Grid container
					direction="row"
					justify="space-evenly"
					spacing={8}
					alignItems="flex-start">
					<Grid item>
						<ValueTextBox text={daiToIncubate} placeholder="Dai" changeText={setDaiToIncubateText} entireAction={() => setDaiToIncubateText(daiBalance)} />
					</Grid>
					<Grid item>
						<List>
							<ListItem></ListItem>
							<ListItem><Typography variant="subtitle2">
								will create
						</Typography></ListItem>
						</List>
					</Grid>
					<Grid item>
						<List>
							<ListItem>
								<TextField
									label="WeiDai"
									type="text"
									name="WeiDai"
									autoComplete="WeiDai"
									margin="normal"
									variant="outlined"
									value={weiDaiToCreate}
								/>
							</ListItem>
							<ListItem></ListItem>
						</List>
					</Grid>
				</Grid>
			</Grid>
			<Grid item>
				<List>
					<ListItem>
						<Button onClick={async () => buyWeiDaiAction(daiToIncubate, split, props.currentUser, setSpinnerVisibility, incubatingWeiDai == 0)}>Create</Button>
					</ListItem>
					<ListItem>
						<Link variant="button" onClick={() => { alert("todo: split rate pop up or slide down: "); setSplit(20) }}>Change split rate</Link>
					</ListItem>
				</List>
			</Grid>
			<Grid item>
				Incubating WeiDai: {incubatingWeiDai}
			</Grid>
			<Grid item>
				Blocks incubated: {progressBlock}/{holderIncubationDuration}
			</Grid>
			<Grid item>
				Todo: progress bar
			</Grid>
			<Grid item>
				<Typography variant="h5" color="secondary">
					Current Penalty: {currentWithdrawalPenalty}
				</Typography>
			</Grid>
			<Grid item>
				<ValueTextBox placeholder="WeiDai" text={weiDaiToClaim} changeText={(text: string) => { setWeiDaiToClaim(text) }} entireAction={() => setWeiDaiToClaim(incubatingWeiDai.toString())} />
			</Grid>
			<Grid item>
				<Button onClick={() => {
					alert("todo: claim weidai")
				}}>
					Claim{parseInt(currentWithdrawalPenalty) > 0 ? ' with penalty' : ''}
				</Button>
			</Grid>
		</Grid>
	)
}

export const PatienceRegulationEngine = withStyles(style)(patienceRegulationEngineComponent)

const buyWeiDaiAction = async (dai: string, split: number, user: string, setSpinnerVisibility: (visible: boolean) => void, createEnabled: boolean) => {
	if (!createEnabled)
		alert('TODO: insert weidai incubating message')
	setSpinnerVisibility(true)

	try {
		alert(`waiting for Api to create using ${dai} with a splitrate of ${split} by user ${user}`)
	} finally {
		setSpinnerVisibility(false)
	}
}