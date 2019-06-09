import * as React from 'react'
import { useState, useEffect } from 'react'
import { Grid, withStyles, List, ListItem } from '@material-ui/core';
import { themedText } from './Common'
import API from '../../../blockchain/ethereumAPI'
import { DetailProps } from './Detail'


export interface ContractProps {
	setDetailProps: (props: DetailProps) => void
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


function ContractSectionComponent(props: ContractProps) {
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
			<ListItem button onClick={() => props.setDetailProps({ ...weiDaiDetail, visible: true })}>
				{getLine("WEIDAI PRICE", `${weiDaiPrice} DAI`)}
			</ListItem>
			<ListItem button>
				{getLine("PENALTY REDUCTION PERIOD", penaltyReductionPeriod)}
			</ListItem>
			<ListItem button>
				{getLine("LAST PENALTY ADJUSTMENT BLOCK", lastAdjustmentBlock)}
			</ListItem>
			<ListItem button>
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

const weiDaiDetail: DetailProps = {
	visible: false,
	header: "WeiDai balance",
	content: "Weidai is an ERC20 token collateralized by the Dai stablecoin in a smart contract. It is fully decentralized.",
	linkText: "Learn more",
	linkURL: "https://medium.com/"
}

export const ContractSection = withStyles(textStyle)(ContractSectionComponent)