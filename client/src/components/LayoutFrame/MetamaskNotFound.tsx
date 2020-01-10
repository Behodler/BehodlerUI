import * as React from 'react'
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import metamask from '../../images/metamaskbuttonlogo.png'
import { Grid, DialogContent, withStyles } from '@material-ui/core';
// import blueGrey from '@material-ui/core/colors/blueGrey'
import grey from '@material-ui/core/colors/grey'
// import deepPurple from '@material-ui/core/colors/deepPurple'
// import cyan from '@material-ui/core/colors/cyan'
import purple from '@material-ui/core/colors/purple'
interface formProps {
	show: boolean,
	closeAction: (show: boolean) => void,
	classes?: any
}

const formStyle = (theme: any) => ({
	title: {
		fontSize: 15,
		backgroundColor: grey[700].toString(),
	},
	message: {
		fontSize: 16,
	},
	errorLabel: {
		paddingTop: 0,
		paddingBottom: 0
	},
	dialog: {
		height: 150,
		paddingTop: 20
	},
	button: {
		padding: "0 20 0 20"
	},
	link: {
		color: purple[300].toString()
	}
})

function MetamaskNotFoundComponent(props: formProps) {
	return <Dialog
		open={props.show}
		onClose={() => props.closeAction(false)}
		scroll="body"
		fullWidth={true}
	>
		<DialogTitle className={props.classes.title} id="form-dialog-title">Install Browser Wallet</DialogTitle>
		<DialogContent className={props.classes.dialog}>
			<Grid
				container
				direction="column"
				justify="center"
				alignItems="center"
				spacing={4}
			>
				<Grid item>WeiDai requires Metamask, an Ethereum wallet browser extension. </Grid>
				<Grid item>

					<Button className={props.classes.button} variant="outlined" onClick={() => window.open('https://metamask.io/', '_blank')}>
						<Grid
							container
							direction="row"
							justify="center"
							alignItems="center"
							spacing={2}
						>
							<Grid item>
								Install Metamask
						</Grid>
							<Grid>
								<img width={30} src={metamask}></img>
							</Grid>
						</Grid>
					</Button>
				</Grid>
				<Grid item>
					<Button variant="text" className={props.classes.link} onClick={() => window.open("https://ethereum.org/dapps/#3-what-is-a-wallet-and-which-one-should-i-use", "_blank")}>
						New to Ethereum? Learn more about wallets</Button>
				</Grid>
			</Grid>
		</DialogContent>
	</Dialog>
}

const MetamaskNotFound = withStyles(formStyle)(MetamaskNotFoundComponent)
export default MetamaskNotFound