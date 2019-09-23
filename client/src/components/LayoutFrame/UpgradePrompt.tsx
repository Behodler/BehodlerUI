import * as React from 'react'
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { withStyles, Grid, List, ListItem } from '@material-ui/core';
import API, { userWeiDaiBalances } from '../../blockchain/ethereumAPI'
import { formatDecimalStrings } from '../../util/jsHelpers'
interface UpgradePromptProps {
	balances: userWeiDaiBalances[]
	enabled: boolean,
	oldBalances: boolean
	walletAddress: string
	classes?: any
}

const style = (theme: any) => ({

})

let titleBaseString = `Important notice: MakerDAO periodically releases new versions of Dai which means new versions of WeiDai have to be released.`

function UpgradePrompt(props: UpgradePromptProps) {

	let message = props.enabled ? "You are currently using an old version of WeiDai. All functionality except redeem has been disabled." : ""
	return <Dialog
		open={true}
	>
		<DialogTitle>
			{titleBaseString}
		</DialogTitle>
		<DialogContent>
			<h4>{message}</h4>
			<Upgrade show={!props.enabled} walletAddress={props.walletAddress} />
			<BalancesPanel {...props} />
		</DialogContent>
	</Dialog>
}

interface upgradeProps {
	show: boolean
	walletAddress: string
}

function Upgrade(props: upgradeProps) {
	if (!props.show)
		return <div>hello</div>
	return <div>
		<h4>To use the latest WeiDai, you will to upgrade your active version.</h4>
		<Button color="secondary" variant="contained" onClick={async () => {
			const defaultVersion = await API.Contracts.VersionController.getDefaultVersion().call({ from: props.walletAddress })
			await API.Contracts.VersionController.setActiveVersion(defaultVersion).send({ from: props.walletAddress })
		}}
		>Upgrade Now</Button>
	</div>
}

function BalancesPanel(props: UpgradePromptProps) {
	if (!props.oldBalances)
		return <div></div>
	let key = 0;
	return <div>
		<h4>You should claim and redeem old WeiDai balances before proceeding</h4>
		<List>
			{props.balances.map(balance => (
				<ListItem key={balance.version + key++}>
					<Grid container
						direction="column"
						spacing={1}
						justify="center"
						alignItems="stretch"
					>
						<Grid item key={"versionItem" + key}>
							<h3>Version: {balance.version}</h3>
						</Grid>
						<Grid item key={"incubating" + key}>
							<Grid container direction="row" justify="flex-start" alignItems="center" spacing={3}>
								<Grid item>
									<h4>Incubating: {formatDecimalStrings(API.fromWei(balance.incubating))}</h4>
								</Grid>
								<Grid item>
									<h4>Actual: {formatDecimalStrings(API.fromWei(balance.actual))}</h4>
								</Grid>
								<Grid item>
									<Button color="secondary" variant="contained" onClick={async () => {
										API.resetVersionBalances()
										await API.Contracts.VersionController.claimAndRedeem(balance.version).send({ from: props.walletAddress });
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