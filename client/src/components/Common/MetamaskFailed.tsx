import * as React from 'react'
import metamasklogo from '../../images/metamasklogo.png';
import { withStyles, Grid, Button } from '@material-ui/core';
import ethereumAPI  from '../../blockchain/ethereumAPI'
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
	enabled: boolean
	classes?: any
}

function MetamaskFailedComponent(props: props) {
	if (props.connected && props.enabled)
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
											<p className={props.classes.heading}>
												{!props.enabled ? "Metamask browser extension is required." :
													"WeiDai is not connected to the Metamask browser extension."}
											</p>
										</Grid>
										<Grid item>
											<img src={metamasklogo} width={150} />
										</Grid>
										{!props.enabled?
										<Grid item>
											<div className={props.classes.subheading}>
												Please install the Metamask browser extension. Visit <a href="https://metamask.io/" target="_blank">this link</a> for more info.
												</div>
										</Grid>
										:""
										}
										{props.enabled && !props.connected ?
											<Grid item >
												<Button onClick={async ()=>{await ethereumAPI.connectMetaMask()}} variant="contained" color="primary">Connect to Metamask</Button>
											</Grid>
											: ""}
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