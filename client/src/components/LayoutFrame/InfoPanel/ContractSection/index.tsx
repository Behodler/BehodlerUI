import * as React from 'react'
import { useState, useEffect } from 'react'
import { Grid, withStyles, List, ListItem } from '@material-ui/core';
import { themedText } from '../Common'
import API from '../../../../blockchain/ethereumAPI'
export interface ContractProps {
	weidaiPrice: number
	penaltyReductionPeriod: number
	nextPenaltyAdjustment: number,
	totalPriceGrowth: number,
	annualizedGrowth: number,
	classes?: any
}

const textStyle = (theme: any) => ({
	text: {
		fontSize: 14,
		fontFamily: "Syncopate",
		margin: "0",
		fontWeight: 600
	}
})

function ContractSectionComponent(props: any) {
	const classes = props.classes
	const [weiDaiPrice, setWeiDaiPrice] = useState<number>(0)
	const [penaltyReductionPeriod, setPenaltyReductionPeriod] = useState("0")
	const [lastAdjustmentBlock, setAdjustment] = useState("0")
	const [totalPriceGrowth, setTotalPriceGrowth] = useState<number>(0)
	const getLine = getLineFactory(classes)

	useEffect(() => {
		const effect = API.bankEffects.daiPerMyriadWeidaiEffect()
		const subscription = effect.Observable.subscribe((exchangeRate) => {
			const weiDaiExchangeRate = 1 / parseInt(exchangeRate)
			const growth = (weiDaiExchangeRate - 0.01) / 100
			setWeiDaiPrice(weiDaiExchangeRate)
			setTotalPriceGrowth(growth)
		})

		return function () {
			subscription.unsubscribe()
			effect.cleanup()
		}
	})

	useEffect(() => {
		const effect = API.preEffects.currentPenalty()
		const subscription = effect.Observable.subscribe((penalty) => {
			setPenaltyReductionPeriod(penalty)
		})
		return () => {
			subscription.unsubscribe()
			effect.cleanup()
		}
	})

	useEffect(() => {
		const effect = API.preEffects.lastAdjustmentBlock()
		const subscription = effect.Observable.subscribe((last) => {
			setAdjustment(last)
		})
		return () => {
			subscription.unsubscribe()
			effect.cleanup()
		}
	})

	return (
		<List>
			<ListItem>
				{getLine("WEIDAI PRICE", `${weiDaiPrice} DAI`)}
			</ListItem>
			<ListItem>
				{getLine("PENALTY REDUCTION PERIOD", penaltyReductionPeriod)}
			</ListItem>
			<ListItem>
				{getLine("LAST PENALTY ADJUSTMENT BLOCK", lastAdjustmentBlock)}
			</ListItem>
			<ListItem>
				{getLine("TOTAL PRICE GROWTH", totalPriceGrowth, true)}
			</ListItem>
		</List>
	)
}


function getLineFactory(classes: any) {

	return function (label: string, detail: number | string, percentage: boolean = false) {
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
					{paragraph(detail, percentage)}
				</Grid>
			</Grid>
		)
	}
}

export const ContractSection = withStyles(textStyle)(ContractSectionComponent)