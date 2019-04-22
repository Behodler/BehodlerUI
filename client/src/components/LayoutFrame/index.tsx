import * as React from 'react'

import { withStyles, Drawer, Divider, Hidden, Grid } from '@material-ui/core';
import WeidaiLogo from './WeidaiLogo'
import { UserSection } from './ActionPanel/UserSection'
import { AdminSection } from './ActionPanel/AdminSection'
import { ContractSection } from './InfoPanel/ContractSection/index'
import { WalletSection, populateWalletProps } from './InfoPanel/WalletSection'
import Mobile from './ActionPanel/Mobile'
import { WalletProps } from './InfoPanel/WalletSection'
import sections from '../../redux/sections'

export interface LayoutFramePropsOnly {
	metaMaskEnabled: boolean,
	metamaskConnected: boolean,
	connectingAccount: boolean
	classes?: any
}

export interface LayoutFrameActionsOnly {
	connectToMetamask: () => void
}

export interface LayoutFrameProps extends LayoutFramePropsOnly, LayoutFrameActionsOnly, WalletProps {
}


export const populateLayoutFrameProps = (props: any): LayoutFrameProps => {
	const walletProps = populateWalletProps(props)

	const connectToMetamask = props.connectToMetamask

	const layoutProps = props[sections.layoutSection]
	const layoutActions: LayoutFrameActionsOnly = { connectToMetamask }

	return {
		...walletProps,
		...layoutProps,
		...layoutActions
	}

}

const actionWidth: number = 250
const infoWidth: number = 400

let styleObject = {
	root: {
		display: 'flex',
	},
	actionDrawer: {
		width: actionWidth,
		flexShrink: 0,
	},
	infoDrawer: {
		width: infoWidth,
		flexShrink: 0,
	},
	actionDrawerPaper: {
		width: actionWidth
	},
	infoDrawerPaper: {
		width: infoWidth
	},
	content: {
		flexGrow: 1
	},
	heading: {
		fontSize: 40,
		fontFamily: 'Syncopate',
		margin: "10px 0 5px 0"
	},
	subheading: {
		fontSize: 16,
		margin: "0px 0 5px 0"
	},
	infoDivider: {
		margin: "100px 0 25px 0"
	}
}

let styles = (theme: any) => styleObject


class LayoutFrameComponent extends React.Component<LayoutFrameProps, any>{

	componentDidMount() {
		console.log("about to connect")
		this.props.connectToMetamask()
	}

	constructor(props: LayoutFrameProps) {
		super(props)
	}


	render() {
		const { classes, ...nonStyleProps } = this.props

		const noMetamask = <div><button onClick={async () => { await this.props.connectToMetamask() }}>connect</button></div>
		const notConnected = "METAMASK NOT CONNECTED!"
		let error:any = null
		if (!this.props.metaMaskEnabled)
			error = noMetamask
		else if (!this.props.metamaskConnected)
			error = notConnected

		return !!error ? error : (
			<div className={classes.root}>

				<Hidden mdDown>
					<Drawer variant="permanent"
						className={classes.actionDrawer}
						classes={{ paper: classes.actionDrawerPaper }}
					>
						<UserSection />
						<Divider />
						<AdminSection />
					</Drawer>
				</Hidden>
				<main className={classes.content}>
					<Mobile />
					<Grid
						container
						direction="row"
						justify="center"
						alignItems="center">
						<Grid item>
							<Grid
								container
								direction="column"
								justify="center"
								alignItems="center"
								spacing={0}>
								<Grid item>
									<Grid
										container
										direction="row"
										justify="space-evenly"
										alignItems="center"
										spacing={32}>
										<Grid item>
											<p className={classes.heading}>
												WEIDAI
												</p>
										</Grid>
										<Grid item>
											<WeidaiLogo />
										</Grid>
									</Grid>
								</Grid>
								<Grid item>
									<p className={classes.subheading}>
										THE WORLD'S FIRST THRIFTCOIN
									</p>
								</Grid>
							</Grid>
						</Grid>
					</Grid>
					<Divider variant="middle" />
					<Grid
						container
						justify="center"
						alignItems="stretch"
						direction="column">
						<Grid item>
							Content
						</Grid>
					</Grid>
				</main>
				<Hidden mdDown>
					<Drawer variant="permanent" anchor="right"
						className={classes.infoDrawer}
						classes={{ paper: classes.infoDrawerPaper }}
					>
						<WalletSection
							{...nonStyleProps}
						/>
						<Divider className={classes.infoDivider} />
						<ContractSection weidaiPrice={0.74}
							penaltyReductionPeriod={120}
							nextPenaltyAdjustment={17453362}
							totalPriceGrowth={344}
							annualizedGrowth={21} />
					</Drawer>
				</Hidden>
			</div>
		)
	}
}

export const LayoutFrame = withStyles(styles)(LayoutFrameComponent)