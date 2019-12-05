import * as React from 'react'
import { useState, useEffect } from 'react'
import { withStyles, Grid, Typography, Button, Divider, Switch, FormGroup, FormControlLabel, Box, Theme } from '@material-ui/core';
import API from '../../blockchain/ethereumAPI'
import { ValueTextBox } from '../Common/ValueTextBox'
import FormDialog from '../Common/FormDialog'
import { IncubationProgress } from './IncubationProgress'
import { formatNumberText, formatDecimalStrings, isLoaded } from '../../util/jsHelpers'
import Tooltip from '@material-ui/core/Tooltip';
import { Loading } from '../Common/Loading';

interface PREprops {
	currentUser: string
	classes?: any
}

const HtmlTooltip = withStyles((theme: Theme) => ({
	tooltip: {
		backgroundColor: '#f5f5f9',
		color: 'rgba(0, 0, 0, 0.87)',
		maxWidth: 220,
		fontSize: theme.typography.pxToRem(14),
		border: '1px solid #dadde9',
	},
}))(Tooltip);

const style = {
	pagebreak: {
		margin: "55px"
	},
	splitRate: {
		marginTop: "10px",
		fontSize: "10"
	},
	pageSplit: {
		margin: "20px"
	},
	bottomBox: {
		marginBottom: "100px"
	},
	createErrorMargin: {
		marginTop: '10px'
	},
	incubationDuration: {
		fontWeight: 800
	}
}

function patienceRegulationEngineComponent(props: PREprops) {
	const [incubationDuration, setIncubationDuration] = useState<string>("unset")
	const [daiBalance, setDaiBalance] = useState<string>("unset")
	const [daiToIncubate, setDaiToIncubate] = useState<string>("")
	const [weiDaiToCreate, setweiDaiToCreate] = useState<string>("")
	const [exchangeRate, setExchangeRate] = useState<number>(0)
	const [incubatingWeiDai, setIncubatingWeiDai] = useState<number>(0)
	const [progressBlock, setProgressBlock] = useState<number>(0)
	const [holderIncubationDuration, setHolderIncubationDuration] = useState<number>(0)
	const [currentWithdrawalPenalty, setCurrentWithdrawalPenalty] = useState<string>("unset")
	const [drawDownPeriodForUser, setDrawDownPeriodForUser] = useState(0)
	const [split, setSplit] = useState<string>("")
	const [customSplitChecked, setCustomSplitChecked] = useState<boolean>(false)
	const [progressBar, setProgressBar] = useState<number>(0)
	const [daiEnabled, setDaiEnabled] = useState<boolean>(false)
	const [showInvalidDaiWarning, setShowInvalidDaiWarning] = useState<boolean>(false)
	const [claimWithPenaltyPopup, setClaimWithPenaltyPopup] = useState<boolean>(false)
	const [toolTipText, setToolTipText] = useState<string>("")
	const [loaded, setLoaded] = useState<boolean>(false)

	const invalidDaiWarning = function (show: boolean) {
		if (show)
			return <Grid item>
				<Typography className={props.classes.createErrorMargin} variant="caption">
					before clicking create, enter a valid number for dai (text box above)
				</Typography>

			</Grid>
		return ""
	}

	useEffect(() => {
		setLoaded(isLoaded([currentWithdrawalPenalty, daiBalance, currentWithdrawalPenalty]))
	}, [currentWithdrawalPenalty, daiBalance, incubationDuration])

	useEffect(() => {
		const parsedSplit = parseInt(split)
		const numSplit = isNaN(parsedSplit) ? 10 : parsedSplit

		setToolTipText(`When a user burns WeiDai (E.G. redeeming for Dai incurs a 2% burn fee), a certain percentage of the delegated amount to be burnt is sent to the developer as a donation. This percentage is determined by the Split Rate. The left over portion is then burnt (deleted), diminishing the supply of WeiDai, pushing up the Redeem rate. For instance, if 10 WeiDai are burnt with a split rate of ${numSplit} then ${numSplit / 10} is donated to the developer and ${(100 - numSplit) / 100 * 10} is burnt. Since burning pushes up the redeem rate, it can be considered a donation to the WeiDai community.`)
	}, [split])

	useEffect(() => {
		const effect = API.daiEffects.allowance(props.currentUser, API.Contracts.WeiDaiBank.address)
		const subscription = effect.Observable.subscribe((allowance) => {
			let ethScaledAllowance = parseFloat(API.fromWei(allowance))
			const daiBalanceFloat = parseFloat(daiBalance)
			const nan = isNaN(ethScaledAllowance) || isNaN(daiBalanceFloat)
			setDaiEnabled(!nan && ethScaledAllowance > daiBalanceFloat)
		})
		return () => { subscription.unsubscribe(); effect.cleanup() }
	})

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
			const incubatingWeiDaiNum: number = parseFloat(formatDecimalStrings(incubating))
			if (incubatingWeiDaiNum > 0) {
				setDaiToIncubate("")
				setweiDaiToCreate("")
			}
			setIncubatingWeiDai(incubatingWeiDaiNum)
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

			const totalBlockDuration = drawDownPeriodForUser * 20
			const currentBlock = result.blockNumber - result.blockOfPurchase
			const progressBlock = currentBlock > totalBlockDuration ? totalBlockDuration : currentBlock
			setProgressBlock(progressBlock)
			setHolderIncubationDuration(totalBlockDuration)
			const progressBarIncrement = Math.round(progressBlock * 100 / totalBlockDuration)

			setProgressBar(isNaN(progressBarIncrement) ? 0 : progressBarIncrement)
		})

		return () => { subscription.unsubscribe(); effect.cleanup() }
	})

	const setDaiToIncubateText = (text: string) => {
		const newText = formatNumberText(text)
		const newTextNum = parseFloat(newText)
		const daiBalanceNum = parseFloat(daiBalance)
		const cappedText = newTextNum > daiBalanceNum ? daiBalance : newText

		setDaiToIncubate(cappedText)
		const weiDaiToCreateNumber = (parseFloat(cappedText) * 10000) / exchangeRate
		setweiDaiToCreate(`${isNaN(weiDaiToCreateNumber) ? '' : weiDaiToCreateNumber}`)
	}

	const setSplitText = (text: string) => {
		const newText = formatNumberText(text)
		let newTextInt = parseInt(newText)
		if (isNaN(newTextInt)) {
			setSplit('')
			return
		}
		else if (newTextInt >= 100)
			newTextInt = 99
		else if (newTextInt < 0)
			newTextInt = 0
		setSplit(`${newTextInt}`)
	}



	const calculateNetWeiDai = (penalty, weiDaiToCreate) => {
		const penaltyNum = parseInt(penalty) / 100
		const weiNum = parseFloat(weiDaiToCreate)
		return Math.round((weiNum * (1 - penaltyNum) * 1000)) / 1000
	}

	if (!loaded)
		return <Loading />

	return (
		<div className={props.classes.root}>
			<FormDialog fieldNames={[]} fieldUpdate={[() => { }]} fieldText={[]} isOpen={claimWithPenaltyPopup}
				message={`WeiDai after early claim penalty: ${calculateNetWeiDai(currentWithdrawalPenalty, incubatingWeiDai)}`}
				title="Claiming WeiDai before full incubation incurs a penalty. Proceed?"
				validationErrors={[]}
				close={() => { setClaimWithPenaltyPopup(false) }}
				submit={async () => {
					setClaimWithPenaltyPopup(false)
					await API.Contracts.PRE.claimWeiDai().send({ from: props.currentUser })

				}}
				acceptLabel='claim'
			/>
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
							<Typography variant="h5">
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
						It currently takes <Typography className={props.classes.incubationDuration} display="inline">{incubationDuration}</Typography> block{parseInt(incubationDuration) !== 1 ? 's' : ''} to create WeiDai
				</Typography>
				</Grid>
				<Grid item>
					<div className={props.classes.pagebreak}></div>
				</Grid>
				<Grid item>
					<Grid container
						direction="row"
						justify="space-between"
						spacing={4}
						alignItems="center">
						<Grid item>
							<Typography variant="h6">
								Your Dai balance
							</Typography>
						</Grid>
						<Grid item>
							<Typography variant="h6" >
								{formatDecimalStrings(daiBalance)}
							</Typography>
						</Grid>
					</Grid>
				</Grid>
				<Box component="div" display={incubatingWeiDai > 0 ? "none" : "inline"}>
					<Divider className={props.classes.pageSplit} />
					<Grid item>
						<Grid container
							direction="column"
							justify="space-around"
							spacing={3}
							alignItems="center">
							<Grid item>
								<ValueTextBox text={daiToIncubate} placeholder="Dai" changeText={setDaiToIncubateText} entireAction={() => setDaiToIncubateText(daiBalance)} />
							</Grid>
							<Grid item>

								<Box component="div">
									<Typography variant="subtitle2">
										will create
								</Typography>
								</Box>
							</Grid>
							<Grid item>
								<Box component="div">
									<Typography variant="h6" >
										{weiDaiToCreate.length == 0 ? 0 : weiDaiToCreate} WeiDai
									</Typography>
								</Box>
							</Grid>
							<Grid item>
								&nbsp;
							</Grid>
						</Grid>
					</Grid>
					<Grid item>
						<Grid
							container
							direction="column"
							justify="flex-start"
							alignItems="center"
							spacing={0}>
							<Grid item>
								{daiEnabled ? <Button variant="contained" color="primary" onClick={async () => buyWeiDaiAction(daiToIncubate, split, props.currentUser, incubatingWeiDai == 0, setShowInvalidDaiWarning)}>Create</Button>
									: <Button size="large" variant="contained" color="secondary" onClick={async () => {
										await API.Contracts.Dai.approve(API.Contracts.WeiDaiBank.address, API.UINTMAX).send({ from: props.currentUser })
									}}>Enable Dai</Button>
								}

							</Grid>
							{invalidDaiWarning(showInvalidDaiWarning)}
							<Grid item className={props.classes.splitRate}>
								{daiEnabled ?
									<HtmlTooltip title={toolTipText} aria-label={toolTipText}>
										<FormGroup row>
											<FormControlLabel
												label="set custom split rate (advanced)"
												control={
													<Switch color="primary" checked={customSplitChecked} onChange={(event) => {
														setCustomSplitChecked(event.target.checked)
														if (!event.target.checked)
															setSplit("10")
													}
													}
													/>
												}
											/>
										</FormGroup>
									</HtmlTooltip>
									: ""
								}
							</Grid>
							<Grid item>
								<Box component="div" visibility={customSplitChecked ? "visible" : "hidden"}>
									<ValueTextBox text={split} placeholder={"Split Rate"} changeText={setSplitText}></ValueTextBox>
								</Box>
							</Grid>
						</Grid>
					</Grid>
				</Box>
			</Grid>
			<Box component="div" display={incubatingWeiDai > 0 ? "inline" : "none"}>
				<Divider className={props.classes.pageSplit} />
				<Grid
					className={props.classes.bottomBox}
					container
					direction="column"
					justify="flex-start"
					alignItems="center"
					spacing={0}>
					<Grid item>
						<Typography variant="h5">
							Incubating WeiDai: {incubatingWeiDai}
						</Typography>
					</Grid>
					<Grid item>
						<Typography variant="subtitle1">
							Blocks incubated: {progressBlock}/{holderIncubationDuration}
						</Typography>
					</Grid>
					<Grid item>
						<IncubationProgress progress={progressBar} />
					</Grid>
					<Grid item>
						<Typography variant="h6">
							Current Penalty: {currentWithdrawalPenalty}%
						</Typography>
					</Grid>
					<Grid item>
						<Button variant="contained" color={parseInt(currentWithdrawalPenalty) > 0 ? "secondary" : "primary"} onClick={async () => {
							if (parseInt(currentWithdrawalPenalty) > 0) {
								setClaimWithPenaltyPopup(true)
							} else {
								await API.Contracts.PRE.claimWeiDai().send({ from: props.currentUser })
							}
						}}>
							Claim{parseInt(currentWithdrawalPenalty) > 0 ? ' with penalty' : ''}
						</Button>
					</Grid>
				</Grid>
			</Box>
		</div>
	)
}

export default withStyles(style)(patienceRegulationEngineComponent)

const buyWeiDaiAction = async (dai: string, split: string, user: string, createEnabled: boolean, showError: (show: boolean) => void) => {
	if (!createEnabled)
		return
	let splitInt = parseInt(split)
	splitInt = isNaN(splitInt) ? 10 : splitInt
	const convertedDai = parseFloat(dai)
	if (isNaN(convertedDai)) {
		showError(true)
		return
	}
	showError(false)
	let unscaledDai = API.toWei(dai)
	await API.Contracts.PRE.buyWeiDai(unscaledDai, `${splitInt}`).send({ from: user })
}