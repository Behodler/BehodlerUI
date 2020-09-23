import * as React from 'react'
import { useState, useEffect, useContext } from 'react'
import { Grid, makeStyles, createStyles, IconButton, Typography } from '@material-ui/core';
import discord from '../../../src/images/behodler/footer/discord.png'
import medium from '../../../src/images/behodler/footer/medium.png'
import github from '../../../src/images/behodler/footer/Github.png'
import faq from '../../../src/images/behodler/footer/FAQ.png'
import uniswap from '../../../src/images/behodler/footer/uniswap.png'
import { Route, Switch, Redirect } from 'react-router-dom'
import Swap, { permittedRoutes as permittedBehodlerRoutes } from '../Behodler/Swap/index'
import Admin from '../Behodler/Admin/index'


import MetamaskNotFound from './MetamaskNotFound'
import { WalletContext } from '../Contexts/WalletStatusContext'

const useStyles = makeStyles(theme => createStyles({
	layoutFrameroot: {
		display: "flex",
		flexFlow: 'column',
		height: '100%',

	},
	layoutFramerRotNotConnected: {
		display: "flex",
		flexFlow: 'column',
		height: '100%',
		background: "linear-gradient(to bottom left, #9DC8F2, white)",
		backgroundRepeat: 'repeat-y',
		backgroundSize: 'cover'
	},
	content: {
		flexGrow: 1,
		width: '100%',
		margin: 0
	},
	footerDiv: {
		position: 'relative',
		left: 0,
		// bottom: 205,
		bottom: 0,
		width: '100%',
		color: 'black',
		textAlign: 'center',
		height: 100
	},
	footerGrid: {
		width: '100%',
		marginBottom: '-8px'
	},
	filledGrid: {
		width: '100%',
		padding: '0 !important'
	}
}))



export default function LayoutFrame(props: any) {
	const [redirect, setRedirect] = useState<string>("")
	const [showMetamaskInstallPopup, setShowMetamaskInstallPopup] = useState<boolean>(false)
	const renderRedirect = redirect !== '' ? <Redirect to={redirect} /> : ''
	const walletContextProps = useContext(WalletContext)
	const setBehodlerRoute = (route: permittedBehodlerRoutes) => {
		setRedirect(route)
	}
	const footerIconWidth = 24
	useEffect(() => {
		if (renderRedirect !== '')
			setRedirect('')
	})

	const classes = useStyles()

	const FilledGridCell = (props: { children: any }) => <Grid className={classes.filledGrid} item> {props.children}</Grid>
	const notConnected: boolean = !walletContextProps.connected || walletContextProps.networkName === '' || !walletContextProps.initialized//|| walletContextProps.account.length < 5
	const openFooter = (url: string) => window.open(url, '_blank')
	return (
		<div className={notConnected ? classes.layoutFramerRotNotConnected : classes.layoutFrameroot}>
			<MetamaskNotFound show={showMetamaskInstallPopup} closeAction={setShowMetamaskInstallPopup} />
			<div>
				{renderRedirect}
			</div>
			<Grid
				container
				direction="column"
				justify="space-evenly"
				alignItems="center" className={classes.content}
				spacing={1}>
				<FilledGridCell>
					<div>
						<Switch>
							<Route path="/" exact >
								<Swap setShowMetamaskInstallPopup={setShowMetamaskInstallPopup} connected={!notConnected} setRouteValue={setBehodlerRoute} route="swap" />
							</Route>
							{walletContextProps.primary ?
								<Route path="/behodler/admin">
									<Admin />
								</Route>
								: ""
							}
							<Route path="/sisyphus">
								<Swap setShowMetamaskInstallPopup={setShowMetamaskInstallPopup} connected={!notConnected} setRouteValue={setBehodlerRoute} route="sisyphus" />
							</Route>
							<Route path="/faucet">
								<Swap setShowMetamaskInstallPopup={setShowMetamaskInstallPopup} connected={!notConnected} setRouteValue={setBehodlerRoute} route="faucet" />
							</Route>
							<Route path="/liquidity">
								<Swap setShowMetamaskInstallPopup={setShowMetamaskInstallPopup} connected={!notConnected} setRouteValue={setBehodlerRoute} route="liquidity" />
							</Route>
							<Route path="/swap">
								<Swap setShowMetamaskInstallPopup={setShowMetamaskInstallPopup} connected={!notConnected} setRouteValue={setBehodlerRoute} route="swap" />
							</Route>
							<Route path="/scarcity">
								<Swap setShowMetamaskInstallPopup={setShowMetamaskInstallPopup} connected={!notConnected} setRouteValue={setBehodlerRoute} route="swap" />
							</Route>

						</Switch>
					</div>
				</FilledGridCell>
				<FilledGridCell>
					<footer>
						<div className={classes.footerDiv}>
							<Grid
								container
								direction="column"
								justify="center"
								alignItems="center"
								spacing={2}
								className={classes.footerGrid}
							>
								<Grid item>
									<Grid
										container
										direction="row"
										justify="center"
										alignItems="center"
										spacing={2}
									>

										<Grid item>
											<IconButton title="github" onClick={() => openFooter('https://github.com/WeiDaiEcosystem')} >
												<img src={github} width={footerIconWidth} />
											</IconButton>
										</Grid>
										<Grid item>
											<IconButton title="medium" onClick={() => openFooter('https://medium.com/weidaithriftcoin')} >
												<img src={medium} width={footerIconWidth} />
											</IconButton>
										</Grid>
										<Grid item>
											<IconButton title="FAQ" onClick={() => openFooter('https://medium.com/weidaithriftcoin/faq-behodler-and-scarcity-scx-98e9baf94ea')} >
												<img src={faq} width={footerIconWidth} />
											</IconButton>
										</Grid>
										<Grid item>
											<IconButton title="discord" onClick={() => openFooter('https://discord.gg/u6hanS')} >
												<img src={discord} width={footerIconWidth} />
											</IconButton>
										</Grid>
										<Grid item>
											<IconButton title="uniswap" onClick={() => openFooter('https://app.uniswap.org/#/swap?inputCurrency=0xff1614c6b220b24d140e64684aae39067a0f1cd0')} >
												<img src={uniswap} width={footerIconWidth} />
											</IconButton>
										</Grid>
										<Grid item>
											<IconButton title="governance" onClick={() => setBehodlerRoute('behodler/admin')} >
												<img src={faq} width={footerIconWidth} />
											</IconButton>
										</Grid>
									</Grid>
								</Grid>
								<Grid item>
									<Typography variant="subtitle2">© 2020 by behodler.io</Typography>
								</Grid>
							</Grid>
						</div>
					</footer>
				</FilledGridCell>
			</Grid>
		</div>
	)
}
