import * as React from 'react'
import metamasklogo from '../../images/metamasklogo.png';
import { withStyles, Grid, Button } from '@material-ui/core';
import ethereumAPI from '../../blockchain/ethereumAPI'
const styleObject = {
	root: {
		display: "flex"
	},
	content: {
		flexGrow: 1,
	},
	heading: {
		fontSize: 30,
		margin: "10px 0 5px 0"
	},
	subheading: {
		fontSize: 16,
		margin: "0px 0 5px 0"
	},
}
let styles = (theme: any) => styleObject

interface props {
	connected: boolean
	enabled: boolean,
	wrongNetwork: boolean
	classes?: any
}


function message(props: props) {
	if (!props.enabled) {
		return <Grid item>
			<div className={props.classes.subheading}>
				Please install the Metamask browser extension. Visit <a href="https://metamask.io/" target="_blank">this link</a> for more info.
			</div>
		</Grid>
	}
	if (props.wrongNetwork) {
		return <Grid item>
			<div className={props.classes.subheading}>
				WeiDai is deployed to the Main Ethereum Network. Please change your network in Metamask and refresh.
			  </div>
		</Grid>
	}
	if (!props.connected) {
		return <Grid item >
			<Button onClick={async () => { await ethereumAPI.connectMetaMask() }} variant="contained" color="primary">Connect to Metamask</Button>
		</Grid>
	}

	return <Grid item>fall through</Grid>
}

function title(props: props) {
	if (!props.enabled) {
		return <p className={props.classes.heading}>
			Metamask browser extension is required.
		</p>
	} if (props.wrongNetwork) {
		return <p className={props.classes.heading}>
			Switch to Ethereum Main Network
	</p>
	} if (!props.connected) {
		return <p className={props.classes.heading}>
			WeiDai is not connected to the Metamask browser extension.
	</p>
	}
	return <p></p>
}

function MetamaskFailedComponent(props: props) {
	if (props.connected && props.enabled && !props.wrongNetwork)
		return null

	return (
		<div className={props.classes.root}>
			<div className={props.classes.content}>
				<main>
					<Grid
						container
						direction="column"
						justify="center"
						alignItems="center"
						spacing={10}
					>
						<Grid item></Grid>
						<Grid item></Grid>
						<Grid item>
							<Grid
								container
								direction="row"
								justify="center"
								alignItems="center"
								alignContent="center">
								<Grid item>
									<Grid container
										direction="column"
										justify="center"
										alignItems="center"
									>
										<Grid item>
											{title(props)}
										</Grid>
										<Grid item>
											<img src={metamasklogo} width={150} />
										</Grid>
										{message(props)}
									</Grid>
								</Grid>
							</Grid>
						</Grid>
						<Grid item>

						</Grid>
					</Grid>
				</main>
			</div>
		</div>);
}

export const MetamaskFailed = withStyles(styles)(MetamaskFailedComponent)