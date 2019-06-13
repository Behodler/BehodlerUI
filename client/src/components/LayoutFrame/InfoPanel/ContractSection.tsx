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
		fontSize: 14,
		fontFamily: "Syncopate",
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
			<ClickAbleInfoListItem details={weiDaiDetail} setDetailProps={props.setDetailProps} setDetailVisibility={props.setDetailVisibility}>
				{getLine("WEIDAI PRICE", `${weiDaiPrice} DAI`)}
			</ClickAbleInfoListItem>
			<ClickAbleInfoListItem details={penaltyReductionPeriodDetail} setDetailProps={props.setDetailProps} setDetailVisibility={props.setDetailVisibility}>
				{getLine("PENALTY REDUCTION PERIOD", penaltyReductionPeriod +' block' + (parseInt(penaltyReductionPeriod)>1?'s':''))}
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
	header: "weidai price",
	content: "WeiDai is an ERC20 token 100% backed by the Dai stable coin. WeiDai price is the amount of Dai that 1 WeiDai can be redeemed for. This number increases with regular use",
	linkText: "Learn more",
	linkURL: "https://medium.com/"
}

const penaltyReductionPeriodDetail: DetailProps = {
	header: "Penalty Reduction Period",
	content: "After WeiDai is created it has to incubate before being withdrawn. If you withdraw newly created WeiDai before the incubation period ends, a penalty tax is levied. The penalty falls by 5 percentage points every penalty reduction period which is measured in Ethereum blocks. For example, suppose the penalty reduction period is 4 and you purchase 200 WeiDai. After 4 blocks have passed, if you attempt to withdraw your WeiDai, you'll only receive 10 since the penalty will be 95%. If you withdraw after 20 blocks, the penalty would have fallen to 75% which means you'll receive 50 WeiDai.",
	linkText: "Learn more",
	linkURL: "https://medium.com/"
}

const adjustmentBlockDetail: DetailProps = {
	header: "Adjustment Block",
	content: "The penalty reduction rate adjusts dynamically in response to how difficult WeiDai makers find it to wait for the entire incubation period, similar to Bitcoin's mining difficulty. The adjustment block is when the penalty was last adjusted",
	linkText: "Learn more",
	linkURL: "https://medium.com/"
}

const totalPriceGrowthDetail: DetailProps = {
	header: "Total Price Growth",
	content: "The initial redeem rate for WeiDai was 1 WeiDai = 0.01 Dai. As the circulating supply is burnt, the redeem rate automatically rises. The total price growth is the percentage that the redeem rate has increased since day 1.",
	linkText: "Learn more",
	linkURL: "https://medium.com/"
}

export const ContractSection = withStyles(textStyle)(ContractSectionComponent)