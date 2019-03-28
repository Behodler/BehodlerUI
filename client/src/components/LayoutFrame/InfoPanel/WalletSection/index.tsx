import * as React from 'react'
import { Grid, withStyles, List, ListItem, IconButton } from '@material-ui/core';
import { themedText } from '../Common'
import Edit from '@material-ui/icons/Edit'

export interface ContractProps {
	walletAddress: string
	friendly: string
	daiBalance: number,
	weiDaiBalance: number,
	incubatingWeiDai: number,
	classes?: any
}

const textStyle = (theme: any) => ({
	text: {
		fontSize: 12,
		fontFamily: "Syncopate",
		margin: "0 0 0 0",
	},
	button: {
		paddingTop:0,
		paddingBottom:0
	}
})

export class WalletSectionComponent extends React.Component<ContractProps, any>{

	render() {
		return (
			this.getList()
		)
	}

	getList() {
		const {classes} = this.props
		return (
			<List>
				<ListItem>
					{this.getLine("Wallet Address", `${this.props.walletAddress}`)}
				</ListItem>
				<ListItem>
					
					{this.getLine("Friendly", this.props.friendly,false,<IconButton className={classes.button}><Edit fontSize="small" /></IconButton> )}

				</ListItem>
				<ListItem>
					{this.getLine("Dai Balance", this.props.daiBalance)}
				</ListItem>
				<ListItem>
					{this.getLine("WeiDai Balance", this.props.weiDaiBalance)}
				</ListItem>
				<ListItem>
					{this.getLine("Incubating WeiDai", this.props.incubatingWeiDai)}
				</ListItem>
			</List>
		)
	}

	getLine(label: string, detail: number | string, percentage: boolean = false, icon: any | undefined = undefined) {
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
					{paragraph(detail, percentage, icon)}
				</Grid>
			</Grid>
		)
	}
}


export const WalletSection = withStyles(textStyle)(WalletSectionComponent)