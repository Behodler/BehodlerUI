import * as React from 'react'
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { withStyles, Grid, List, ListItem } from '@material-ui/core';
import API, { userWeiDaiBalances } from '../../blockchain/ethereumAPI'
import { formatDecimalStrings } from '../../util/jsHelpers'
import {useContext} from 'react'
import { WalletContext } from '../Contexts/WalletStatusContext'

interface UpgradePromptProps {
	classes?: any
}

const style = (theme: any) => ({

})

let titleBaseString = `Important notice: MakerDAO periodically releases new versions of Dai which means new versions of WeiDai have to be released.`

function UpgradePrompt(props: UpgradePromptProps) {
	const walletContextProps = useContext(WalletContext)
	let message = walletContextProps.enabled ? "You are currently using an old version of WeiDai. All functionality except redeem has been disabled." : ""
	return <Dialog
		open={true}
	>
		<DialogTitle>
			{titleBaseString}
		</DialogTitle>
		<DialogContent>
			<h4>{message}</h4>
			<BalancesPanel {...props} />
		</DialogContent>
	</Dialog>
}

function BalancesPanel(props: UpgradePromptProps) {
	const walletContextProps = useContext(WalletContext)
	if (!walletContextProps.oldBalances)
		return <div></div>
	let balances: userWeiDaiBalances[] = []
	walletContextProps.versionBalances.forEach(balance => {
		if (balances.filter(b => b.version == balance.version).length > 0)
			return;
		balances.push(balance)
	})
	return <div>
		<h4>You should claim and redeem old WeiDai balances before proceeding</h4>
		<List>
			{balances.map(balance => (
				<ListItem key={balance.version}>
					<Grid container
						direction="column"
						spacing={1}
						justify="center"
						alignItems="stretch"
					>
						<Grid item>
							<h3>Version: {balance.version}</h3>
						</Grid>
						<Grid item>
							<Grid container direction="row" justify="flex-start" alignItems="center" spacing={3}>
								<Grid item>
									<h4>Incubating: {formatDecimalStrings(API.fromWei(balance.incubating))}</h4>
								</Grid>
								<Grid item>
									<h4>Actual: {formatDecimalStrings(API.fromWei(balance.actual))}</h4>
								</Grid>
								<Grid item>
									<Button color="secondary" variant="contained" onClick={async () => {
										const version = balance.version
										API.resetVersionBalances()
										await walletContextProps.contracts.VersionController.claimAndRedeem(version).send({ from: walletContextProps.account });
									}}>Claim and Redeem</Button>
								</Grid>
							</Grid>
						</Grid>
					</Grid>
				</ListItem>
			))}
		</List>
	</div>
}
export default withStyles(style)(UpgradePrompt)