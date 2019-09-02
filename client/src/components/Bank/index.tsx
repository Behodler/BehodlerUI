import * as React from 'react'
import { useState, useEffect } from 'react'
import { withStyles, Grid, Typography, Box, Button } from '@material-ui/core';
import API from '../../blockchain/ethereumAPI'
import { formatDecimalStrings, formatNumberText } from '../../util/jsHelpers'
import { ValueTextBox } from '../Common/ValueTextBox';

interface bankProps {
	currentUser: string
	classes?: any
}

const style = (theme: any) => {

}

function BankComponent(props: bankProps) {
	const [weiDaiBalance, setWeiDaiBalance] = useState<string>('unset')
	const [reserveDai, setReserveDai] = useState<string>('unset')
	const [weiDaiToRedeem, setWeiDaiToRedeem] = useState<string>('unset')
	const [daiToBeRedeemed, setDaiToBeRedeemed] = useState<string>('unset')
	const [exchangeRate, setExchangeRate] = useState<number>(0)

	useEffect(() => {
		const effect = API.weiDaiEffects.balanceOfEffect(props.currentUser)
		const subscription = effect.Observable.subscribe((balance) => {
			setWeiDaiBalance(formatDecimalStrings(balance))
		})

		return function () {
			effect.cleanup()
			subscription.unsubscribe()
		}
	})

	useEffect(() => {
		const effect = API.daiEffects.balanceOfEffect(API.Contracts.WeiDaiBank.address)
		const subscription = effect.Observable.subscribe((balance) => {
			setReserveDai(formatDecimalStrings(balance))
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


	const setDaiToIncubateText = (text: string) => {
		const newText = formatNumberText(text)
		const newTextNum = parseFloat(newText)
		const weiDaiBalanceNum = parseFloat(weiDaiBalance)
		const cappedText = newTextNum > weiDaiBalanceNum ? weiDaiBalance : newText

		setWeiDaiToRedeem(cappedText)
		const daiToRedeem = (parseFloat(cappedText) * 0.98 * exchangeRate) / 10000

		setDaiToBeRedeemed(`${isNaN(daiToRedeem) ? '' : daiToRedeem}`)
	}

	if (parseFloat(weiDaiBalance) == 0) {
		return <div>
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
								You currently do not own WeiDai
					</Typography>
						</Grid>
					</Grid>
				</Grid>
				<Grid item>
					<Typography variant="h6">
						Consider creating some using the Patience Regulation Engine by clicking Create/Redeem
				</Typography>
				</Grid>
			</Grid>
		</div>
	}
	return <div className={props.classes.root}>
		<Grid
			container
			direction="column"
			justify="flex-start"
			alignItems="center"
			spacing={0}>
			<Grid item>
				<Grid container
					direction="row"
					justify="space-between"
					spacing={4}
					alignItems="center">
					<Grid item>
						<Typography variant="h6">
							Dai held in reserve
					</Typography>
					</Grid>
					<Grid item>
						<Typography variant="h6" color="primary">
							{reserveDai}
						</Typography>
					</Grid>
				</Grid>
			</Grid>
			<Grid item>
				<Grid container
					direction="row"
					justify="space-between"
					spacing={4}
					alignItems="center">
					<Grid item>
						<Typography variant="h6">
							Your WeiDai balance
					</Typography>
					</Grid>
					<Grid item>
						<Typography variant="h6" color="primary">
							{weiDaiBalance}
						</Typography>
					</Grid>
				</Grid>
			</Grid>
			<Grid item>
				<Grid container
					direction="column"
					justify="space-around"
					spacing={3}
					alignItems="center">
					<Grid item>
						<ValueTextBox text={weiDaiToRedeem} placeholder="Dai" changeText={setWeiDaiToRedeem} entireAction={() => setDaiToIncubateText(weiDaiToRedeem)} />
					</Grid>
					<Grid item>

						<Box component="div">
							<Typography variant="caption">
								can redeem
						</Typography>
						</Box>
					</Grid>
					<Grid item>
						<Box component="div">
							<Typography variant="h6" color="secondary">
								{daiToBeRedeemed.length == 0 ? 0 : daiToBeRedeemed} Dai
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
						<Button variant="contained" color="primary" onClick={async () => {
							if (isNaN(parseFloat(weiDaiToRedeem)))
								return

							await API.Contracts.WeiDaiBank.redeemWeiDai(weiDaiToRedeem).send({ from: props.currentUser })
						}}>Redeem</Button>
					</Grid>
				</Grid>
			</Grid>
		</Grid>
	</div>
}

export default withStyles(style)(BankComponent)