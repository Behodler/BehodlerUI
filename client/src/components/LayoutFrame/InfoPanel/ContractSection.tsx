import * as React from 'react'
import { useState, useEffect } from 'react'
import { Grid, withStyles, List } from '@material-ui/core';
import { themedText } from './Common'
import API from '../../../blockchain/ethereumAPI'
import { DetailProps } from './Detail'
import { ClickAbleInfoListItem } from './Common'

export interface ContractProps {
	setDetailProps: (props: DetailProps) => void
	setDetailVisibility: (visible: boolean) => void
	classes?: any
}

const textStyle = (theme: any) => ({
	text: {
		fontSize: 13,
		margin: "0",
		fontWeight: 600
	},
	button: {
		paddingTop: 0,
		paddingBottom: 0
	},
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
			const weiDaiExchangeRate = parseInt(exchangeRate) / 10000
			const growth = Math.round(((weiDaiExchangeRate - 0.01) / 0.01) * 10000)/100
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
			<ClickAbleInfoListItem details={weiDaiDetail} setDetailProps={props.setDetailProps} setDetailVisibility={props.setDetailVisibility}>
				{getLine("WEIDAI PRICE", `${weiDaiPrice} DAI`)}
			</ClickAbleInfoListItem>
			<ClickAbleInfoListItem details={penaltyReductionPeriodDetail} setDetailProps={props.setDetailProps} setDetailVisibility={props.setDetailVisibility}>
				{getLine("PENALTY REDUCTION PERIOD", penaltyReductionPeriod + ' block' + (parseInt(penaltyReductionPeriod) > 1 ? 's' : ''))}
			</ClickAbleInfoListItem>
			<ClickAbleInfoListItem details={adjustmentBlockDetail} setDetailProps={props.setDetailProps} setDetailVisibility={props.setDetailVisibility}>
				{getLine("LAST PENALTY ADJUSTMENT BLOCK", lastAdjustmentBlock)}
			</ClickAbleInfoListItem>
			<ClickAbleInfoListItem details={totalPriceGrowthDetail} setDetailProps={props.setDetailProps} setDetailVisibility={props.setDetailVisibility}>
				{getLine("TOTAL PRICE GROWTH", totalPriceGrowth, true)}
			</ClickAbleInfoListItem>
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
				alignItems="center">
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
	header: "WEIDAI PRICE",
	content: "WEIDAI IS AN ERC20 TOKEN 100% BACKED BY THE DAI STABLE COIN. WEIDAI PRICE IS THE AMOUNT OF DAI THAT 1 WEIDAI CAN BE REDEEMED FOR. THIS NUMBER INCREASES WITH REGULAR USE",
	linkText: "Learn more",
	linkURL: "https://medium.com/"
}

const penaltyReductionPeriodDetail: DetailProps = {
	header: "PENALTY REDUCTION PERIOD",
	content: "AFTER WEIDAI IS CREATED IT HAS TO INCUBATE BEFORE BEING WITHDRAWN. IF YOU WITHDRAW NEWLY CREATED WEIDAI BEFORE THE INCUBATION PERIOD ENDS, A PENALTY TAX IS LEVIED. THE PENALTY FALLS BY 5 PERCENTAGE POINTS EVERY PENALTY REDUCTION PERIOD WHICH IS MEASURED IN ETHEREUM BLOCKS. FOR EXAMPLE, SUPPOSE THE PENALTY REDUCTION PERIOD IS 4 AND YOU PURCHASE 200 WEIDAI. AFTER 4 BLOCKS HAVE PASSED, IF YOU ATTEMPT TO WITHDRAW YOUR WEIDAI, YOU'LL ONLY RECEIVE 10 SINCE THE PENALTY WILL BE 95%. IF YOU WITHDRAW AFTER 20 BLOCKS, THE PENALTY WOULD HAVE FALLEN TO 75% WHICH MEANS YOU'LL RECEIVE 50 WEIDAI.",
	linkText: "Learn more",
	linkURL: "https://medium.com/"
}

const adjustmentBlockDetail: DetailProps = {
	header: "ADJUSTMENT BLOCK",
	content: "THE PENALTY REDUCTION RATE ADJUSTS DYNAMICALLY IN RESPONSE TO HOW DIFFICULT WEIDAI MAKERS FIND IT TO WAIT FOR THE ENTIRE INCUBATION PERIOD, SIMILAR TO BITCOIN'S MINING DIFFICULTY. THE ADJUSTMENT BLOCK IS WHEN THE PENALTY WAS LAST ADJUSTED",
	linkText: "Learn more",
	linkURL: "https://medium.com/"
}

const totalPriceGrowthDetail: DetailProps = {
	header: "TOTAL PRICE GROWTH",
	content: "THE INITIAL REDEEM RATE FOR WEIDAI WAS 1 WEIDAI = 0.01 DAI. AS THE CIRCULATING SUPPLY IS BURNT, THE REDEEM RATE AUTOMATICALLY RISES. THE TOTAL PRICE GROWTH IS THE PERCENTAGE THAT THE REDEEM RATE HAS INCREASED SINCE DAY 1.",
	linkText: "Learn more",
	linkURL: "https://medium.com/"
}

export const ContractSection = withStyles(textStyle)(ContractSectionComponent)