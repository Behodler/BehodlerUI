import * as React from 'react'
import { useState, useEffect } from 'react'
import { withStyles, Drawer, Divider, Hidden, Grid, List, ListItem, ClickAwayListener, Box, Paper } from '@material-ui/core';
import WeidaiLogo from './WeidaiLogo'
import { UserSection } from './ActionPanel/UserSection'
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom'
import { AdminSection } from './ActionPanel/AdminSection'
import { ContractSection } from './InfoPanel/ContractSection'
import { WalletSection } from './InfoPanel/WalletSection'
import { Detail, DetailProps } from './InfoPanel/Detail'
import Mobile from './ActionPanel/Mobile'
import API from '../../blockchain/ethereumAPI'
import PatienceRegulationEngine from '../PRE/index'
import Bank from '../Bank/index'
import { MetamaskFailed } from '../Common/MetamaskFailed'

const actionWidth: number = 250
const infoWidth: number = 400

let styleObject = {
	root: {
		display: "flex"
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
	paper:{
		width:"auto",
		margin: "0 auto",
		flexGrow:1,
		height: "100vh"
	},
	heading: {
		fontSize: 40,
		margin: "10px 0 5px 0"
	},
	headingDivider: {
		margin: '10px 0 50px 0'
	},
	subheading: {
		fontSize: 16,
		margin: "0px 0 5px 0"
	},
	infoDivider: {
		margin: "25px 0 25px 0"
	},
	listItem: {
		display: "list-item"
	}
}

let styles = (theme: any) => styleObject

function LayoutFrameComponent(props: any) {

	const [metaMaskConnected, setMetaMaskConnected] = useState<boolean>(API.isMetaMaskConnected())
	const [metaMaskEnabled, setMetaMaskEnabled] = useState<boolean>(API.isMetaMaskEnabled())
	const [detailProps, setDetailProps] = useState<DetailProps>({ header: '', content: '' })
	const [detailVisibility, setDetailVisibility] = useState<boolean>(false)
	const [walletAddress, setWalletAddress] = useState<string>("0x0")
	const [redirect, setRedirect] = useState<string>("")
	const [isPrimary, setIsPrimary] = useState<boolean>(false)

	const renderRedirect = redirect !== '' ? <Redirect to={redirect} /> : ''

	useEffect(() => {
		if (renderRedirect !== '')
			setRedirect('')
	})

	useEffect(() => {
		if (!metaMaskConnected || !metaMaskEnabled) {
			API.connectMetaMask().then(() => {
				setMetaMaskEnabled(API.isMetaMaskEnabled())
				setMetaMaskConnected(API.isMetaMaskConnected())
			})
		}
	})

	useEffect(() => {
		if (metaMaskConnected) {
			const subscription = API.accountObservable.subscribe(account => {
				setWalletAddress(account.account)
				setIsPrimary(account.isPrimary)
			})

			return function () {
				subscription.unsubscribe()
			}
		}
		else {
			return () => { }
		}
	})

	const { classes } = props
	const metamaskMessage = <MetamaskFailed connected={metaMaskConnected} enabled={metaMaskEnabled} />
	const showError: boolean = !(metaMaskConnected && metaMaskEnabled)



	return showError ? metamaskMessage : (
		<div className={classes.root}>
			<Router>
				{renderRedirect}
				<Hidden mdDown>
					<Drawer variant="persistent"
						open={true}
						className={classes.actionDrawer}
						classes={{ paper: classes.actionDrawerPaper }}
					>
						<UserSection goToEngine={() => setRedirect('/engine')} homePage={() => setRedirect('/')} goToBank={() => setRedirect('/bank')} />
						<Divider />
						{isPrimary ?
							<AdminSection /> : ""
						}
					</Drawer>
				</Hidden>
				<Paper className={classes.paper}>
						<Box component="div" className={classes.content}>
							<Mobile goToEngine={() => setRedirect('/engine')} homePage={() => setRedirect('/')} goToBank={() => setRedirect('/bank')}/>
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
												spacing={7}>
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

							<Divider variant="middle" className={classes.headingDivider} />
							<Switch>
								<Route path="/" exact >
									Content
							</Route>
								<Route path="/engine">

									<PatienceRegulationEngine currentUser={walletAddress} />

								</Route>
								<Route path="/bank">
									<Bank currentUser={walletAddress} />
								</Route>
							</Switch>
						</Box>
				</Paper>

				<Hidden mdDown>
					<ClickAwayListener onClickAway={() => setDetailVisibility(false)}>
						<Drawer variant="persistent" anchor="right" open={true}
							className={classes.infoDrawer}
							classes={{ paper: classes.infoDrawerPaper }}
						>
							<List>
								<ListItem className={classes.listItem}><WalletSection setDetailVisibility={setDetailVisibility} setDetailProps={setDetailProps} walletAddress={walletAddress} /></ListItem>
								<ListItem className={classes.listItem}><Divider className={classes.infoDivider} /></ListItem>
								<ListItem className={classes.listItem}><ContractSection setDetailVisibility={setDetailVisibility} setDetailProps={setDetailProps} /></ListItem>
								<ListItem className={classes.listItem}><Divider className={classes.infoDivider} /> </ListItem>
								<ListItem className={classes.listItem}>{detailVisibility ? <Detail {...detailProps} /> : ""}</ListItem>
							</List>
						</Drawer>
					</ClickAwayListener>
				</Hidden>
			</Router>
		</div>
	)
}


export const LayoutFrame = withStyles(styles)(LayoutFrameComponent)