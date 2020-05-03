import * as React from 'react'
import { useState, useEffect, useContext } from 'react'
import { withStyles, Drawer, Divider, Hidden, Grid, List, ListItem, ClickAwayListener, Box, Paper, Button } from '@material-ui/core';
import WeidaiLogo from './WeidaiLogo'
import { UserSection } from './ActionPanel/UserSection'
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom'
import { AdminSection } from './ActionPanel/AdminSection'
import { ContractSection } from './InfoPanel/ContractSection'
import { WalletSection } from './InfoPanel/WalletSection'
import { Detail, DetailProps } from './InfoPanel/Detail'
import Mobile from './ActionPanel/Mobile'
import PatienceRegulationEngine from '../PRE/index'
import Bank from '../Bank/index'
import Home from '../Home/index'
import FAQ from '../FAQ/index'
import Swap from '../Behodler/Swap/index'
import ContractDependencies from '../ContractDependencies/index'
import Admin from '../Behodler/Admin/index'
import UpgradePrompt from './UpgradePrompt'

import MetamaskNotFound from './MetamaskNotFound'
import { WalletContext } from '../Contexts/WalletStatusContext'

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
	paper: {
		width: "auto",
		margin: "0 auto",
		flexGrow: 1,
		height: "140vh"
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
	},
	connectButton: {
		margin: "20px 0 0 0"
	}
}

let styles = (theme: any) => styleObject

function LayoutFrameComponent(props: any) {

	const [detailProps, setDetailProps] = useState<DetailProps>({ header: '', content: '' })
	const [detailVisibility, setDetailVisibility] = useState<boolean>(false)
	const [redirect, setRedirect] = useState<string>("")
	const [showMetamaskInstallPopup, setShowMetamaskInstallPopup] = useState<boolean>(false)
	const renderRedirect = redirect !== '' ? <Redirect to={redirect} /> : ''
	const walletContextProps = useContext(WalletContext)
	useEffect(() => {
		if (renderRedirect !== '')
			setRedirect('')
	})

	const { classes } = props
	const notConnected: boolean = !walletContextProps.connected || !walletContextProps.enabled
	const upgradeRequired: boolean = walletContextProps.connected && ((walletContextProps.oldBalances) && !walletContextProps.primary)

	/*const tabular = {
		'enabled': walletContextProps.enabled,
		'oldBalances': walletContextProps.oldBalances,
		'primary': walletContextProps.primary,
		'connected': walletContextProps.connected,
		'not connected': notConnected,
		'isMetaMask': walletContextProps.isMetamask,
		'initialized': walletContextProps.initialized
	}
	console.table(tabular)*/
	return (
		<div className={classes.root}>
			<MetamaskNotFound show={showMetamaskInstallPopup} closeAction={setShowMetamaskInstallPopup} />
			<Router>
				<div>
					{renderRedirect}
					<Hidden mdDown>
						<Drawer variant="persistent"
							open={true}
							className={classes.actionDrawer}
							classes={{ paper: classes.actionDrawerPaper }}
						>
							<UserSection goToEngine={() => setRedirect('/engine')} homePage={() => setRedirect('/')} goToBank={() => setRedirect('/bank')} faq={() => setRedirect('/FAQ')} behodlerSwap={() => setRedirect('/behodler')} />
							<Divider />
							{walletContextProps.primary ?
								<AdminSection contractDependencies={() => setRedirect('/dependencies')} behodlerAdmin={() => setRedirect('/behodler/admin')} /> : ""
							}
						</Drawer>

					</Hidden>
				</div>
				<Paper className={classes.paper}>
					<Box component="div" className={classes.content}>
						{upgradeRequired ? <UpgradePrompt /> :
							<div>
								<Mobile goToEngine={() => setRedirect('/engine')} homePage={() => setRedirect('/')} goToBank={() => setRedirect('/bank')} goToSwap={() => setRedirect('/behodler')} />
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
											{notConnected || !walletContextProps.isMetamask ?
												<Grid item>
													<Button className={classes.connectButton} color="primary" variant="contained" onClick={async () => {
														walletContextProps.isMetamask ? walletContextProps.connectAction.action() : setShowMetamaskInstallPopup(true)
													}}>Connect Your Wallet</Button>
												</Grid>
												: <div></div>}
										</Grid>
									</Grid>
								</Grid>
								<Divider variant="middle" className={classes.headingDivider} />

								<Switch>
									<Route path="/" exact >
										<Home />
									</Route>
									<Route path="/engine">
										{notConnected ? <Redirect to={"/"} /> : <PatienceRegulationEngine />}
									</Route>
									<Route path="/bank">
										{notConnected ? <Redirect to={"/"} /> : <Bank />}
									</Route>
									<Route path="/FAQ">
										<FAQ />
									</Route>
									{walletContextProps.primary ?
										<Route path="/behodler/admin">
											<Admin />
										</Route>
										: ""
									}
									<Route path="/behodler">
										{notConnected ? <Redirect to={"/"} /> : <Swap />}
									</Route>
									{walletContextProps.primary ?
										<Route path="/dependencies">
											<ContractDependencies />
										</Route>
										: ""
									}

									<Route component={Home} />
								</Switch>

							</div>}
					</Box>
				</Paper>
				{notConnected ? "" :
					<Hidden mdDown>
						<ClickAwayListener onClickAway={() => setDetailVisibility(false)}>
							<Drawer variant="persistent" anchor="right" open={true}
								className={classes.infoDrawer}
								classes={{ paper: classes.infoDrawerPaper }}
							>
								<List>
									<ListItem className={classes.listItem}><WalletSection setDetailVisibility={setDetailVisibility} setDetailProps={setDetailProps} /></ListItem>
									<ListItem className={classes.listItem}><Divider className={classes.infoDivider} /></ListItem>
									<ListItem className={classes.listItem}><ContractSection setDetailVisibility={setDetailVisibility} setDetailProps={setDetailProps} /></ListItem>
									<ListItem className={classes.listItem}><Divider className={classes.infoDivider} /> </ListItem>
									<ListItem className={classes.listItem}>{detailVisibility ? <Detail {...detailProps} /> : ""}</ListItem>
								</List>
							</Drawer>
						</ClickAwayListener>
					</Hidden>
				}
			</Router>
		</div>
	)
}


export const LayoutFrame = withStyles(styles)(LayoutFrameComponent)