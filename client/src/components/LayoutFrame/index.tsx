import * as React from 'react'
import { useState, useEffect, useContext } from 'react'
import { withStyles, Divider, Grid, Box, Paper, Button } from '@material-ui/core';

import { Route, Switch, Redirect, useLocation } from 'react-router-dom'
import Swap, { permittedRoutes as permittedBehodlerRoutes } from '../Behodler/Swap/index'
// import ScarcityLandingPage from '../Behodler/ScarcityLandingPage/index'
import Admin from '../Behodler/Admin/index'

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
		minHeight: "150vh"
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
	let location = useLocation();
	const [redirect, setRedirect] = useState<string>("")
	const [showMetamaskInstallPopup, setShowMetamaskInstallPopup] = useState<boolean>(false)
	const renderRedirect = redirect !== '' ? <Redirect to={redirect} /> : ''
	const walletContextProps = useContext(WalletContext)
	const setBehodlerRoute = (route: permittedBehodlerRoutes) => {
		setRedirect(route)
	}
	useEffect(() => {
		if (renderRedirect !== '')
			setRedirect('')
	})

	const { classes } = props
	const notConnected: boolean = !walletContextProps.connected || walletContextProps.networkName === '' || !walletContextProps.initialized

	return (
		<div className={classes.root}>
			<MetamaskNotFound show={showMetamaskInstallPopup} closeAction={setShowMetamaskInstallPopup} />
			<div>
				{renderRedirect}
			</div>
			<Paper className={classes.paper}>
				<Box component="div" className={classes.content}>
					<div>
						{location.pathname === '/scarcity' ? "" :
							<div>
								{notConnected || !walletContextProps.isMetamask ? <div>
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
								</div>
									: <div></div>}
							</div>}
						<Switch>
							<Route path="/" exact >
								<Swap connected={!notConnected} setRouteValue={setBehodlerRoute} route="swap" />
							</Route>
							{walletContextProps.primary ?
								<Route path="/behodler/admin">
									<Admin />
								</Route>
								: ""
							}
							<Route path="/sisyphus">
								<Swap connected={!notConnected} setRouteValue={setBehodlerRoute} route="sisyphus" />
							</Route>
							<Route path="/faucet">
								<Swap connected={!notConnected} setRouteValue={setBehodlerRoute} route="faucet" />
							</Route>
							<Route path="/pyrotokens">
								<Swap connected={!notConnected} setRouteValue={setBehodlerRoute} route="pyrotokens" />
							</Route>
							<Route path="/swap">
								<Swap connected={!notConnected} setRouteValue={setBehodlerRoute} route="swap" />
							</Route>
							<Route path="/scarcity">
								<Swap connected={!notConnected} setRouteValue={setBehodlerRoute} route="swap" />
							</Route>

						</Switch>
					</div>
				</Box>
			</Paper>
		</div>
	)
}


export const LayoutFrame = withStyles(styles)(LayoutFrameComponent)