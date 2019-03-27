import * as React from 'react'
import { Grid, withStyles, List, ListItem } from '@material-ui/core';
import { themedText} from '../Common'
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
		fontWeight:600
	}
})

export class ContractSectionComponent extends React.Component<ContractProps, any>{

	render() {
		return (
			this.getList()
		)
	}

	getList() {
		return (
			<List>
				<ListItem>
					{this.getLine("WEIDAI PRICE", `${this.props.weidaiPrice} DAI`)}
				</ListItem>
				<ListItem>
					{this.getLine("PENALTY REDUCTION PERIOD", this.props.penaltyReductionPeriod)}
				</ListItem>
				<ListItem>
					{this.getLine("NEXT PENALTY ADJUSTMENT", this.props.nextPenaltyAdjustment)}
				</ListItem>
				<ListItem>
					{this.getLine("TOTAL PRICE GROWTH", this.props.totalPriceGrowth, true)}
				</ListItem>
				<ListItem>
					{this.getLine("ANNUALIZED GROWTH", this.props.annualizedGrowth, true)}
				</ListItem>
			</List>
		)
	}

	getLine(label: string, detail: number|string, percentage: boolean = false) {
		const paragraph = themedText(this.props.classes)
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