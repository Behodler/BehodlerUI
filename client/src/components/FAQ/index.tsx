import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { Grid } from '@material-ui/core';

const styleObject = (theme: any) => ({
	root: {
		width: '100%',
	},
	heading: {
		fontSize: theme.typography.pxToRem(15),
		flexBasis: '33.33%',
		flexShrink: 0,
	},
	secondaryHeading: {
		fontSize: theme.typography.pxToRem(15),
		color: theme.palette.text.secondary,
	},
})

const questions = [
	{
		title: "How reliable is WeiDai?",
		answer: "Since WeiDai is 100% backed by Dai, it can only be as reliable as Dai and no more. If the Dai system or MakerDAO were to stop functioning, WeiDai would also cease to work. Beyond that, the entire system of WeiDai is run on the blockchain with no oracles or human management."
	},
	{
		title: "Is WeiDai decentralized?",
		answer: "The operation of WeiDai is 100% decentralized. The price feeds are outsourced to the MakerDAO oracle network via Dai. For now, WeiDai's contracts can be disabled and the donation address is fixed. This is a necessary safeguard in the early stages in case there are unforeseen bugs. However, once WeiDai is thriving and has an active community, the plan is to hand over full control to a 'WeiDAO'."
	},
	{
		title: "Is this an ICO?",
		answer: "NO! WeiDai is fully functional and has full utility from day 1. There is no fundraising round and no promises for growth or profit are made. There are no WeiDai investors."
	},
	{
		title: "Will WeiDai make me rich?",
		answer: "There is no guarantee that the redeem rate will grow after you create WeiDai. There are no profit guarantees. If you create WeiDai and then redeem without letting the redeem rate rise, you will lose money due to the redemption fee."
	},
	{
		title: "Can WeiDai be pumped or dumped?",
		answer: "So long as Dai is stable, WeiDai will be stable. Demand for WeiDai does not affect the price directly. Only burning can affect the price in terms of Dai. When WeiDai is dumped through redemption, the redeem rate actually rises because 2% of the redeemed WeiDai is burnt."
	},
	{
		title: "What is the split rate?",
		answer: "Every holder of WeiDai has a split rate that determines how much of their burnt WeiDai is donated to the developer and how much is burnt. For instance, a split rate of 15 means that whenever your WeiDai is burnt, 15% of that is given to the developer as a donation and the remaining 85% is burnt."
	},
	{
		title: "Is WeiDai a for-profit enterprise",
		answer: "If everyone sets their split rate to zero, the developer will receive zero compensation. Therefore the developer earns income only from donations."
	},
	{
		title: "If I set the split rate lower, do I save money?",
		answer: "The split rate does not determine how much is deducted from you during a burn. Rather it determines how that portion is split between donation and burning."
	},
	{
		title: "What if everyone sets their split rate to 100%. Will the redeem rate stop growing?",
		answer: "The split rate has an upper limit of 99% so that even if the community is maximally generous to the developer, some WeiDai will still be burnt."
	},
	{
		title: "What will the price of WeiDai be when it lists on decentralized exchanges like Uniswap?",
		answer: "At the time of writing WeiDai isn't listed on any exchanges but I suspect that the price will be slightly lower that the redeem rate. The difference between the redeem rate and the exchange price is the 'patience discount premium'. That is, the value people place on getting the WeiDai right now instead of waiting for the patience regulation engine to incubate. Patient users should be able to make arbitrage profits from this difference."
	},
	{
		title: "Is WeiDai in competition with Dai?",
		answer: "Absolutely not. The relationship between WeiDai and Dai is symbiotic. WeiDai fulfills a similar role to Compound.Finance's cDai"
	},
	{
		title: "Is WeiDai the only thriftcoin?",
		answer: "When I first started this project, the answer was yes. But before I could launch, Compound launched their cDai token. For that reason, cDai is actually the first thriftcoin of which I know."
	},
	{
		title: "Is WeiDai in competition with cDai?",
		answer: "No way. All of us in the DeFi space are in this together. Whenever a new primitive is created, innovative developers find new ways to compose amazing products. For instance, pooltogether uses Compound to create the world's first lossless lottery. To answer the question, cDai is based on interest bearing instruments. WeiDai is based on burn incentives. They likely both have their role and I certainly will be a holder of both."
	},
	{
		title: "Are thriftcoins better than bitcoin?",
		answer: "Bitcoin and thriftcoins serve very different roles. Thriftcoins protect holders from short term volatility and long term inflation. Bitcoin offers no such protection but has the potential to explode in price as we all know. Bitcoin's biggest strength is its immutability of mission. That is, the creator has vanished, the blockchain is secure, the code is treated as sacrosanct and the 21 million limit will never be violated. Asteroids will be mined for gold before Bitcoin's scarcity is threatened."
	},
	{
		title: "What if a new version of Dai is released such as Multicol Dai?",
		answer: "WeiDai is versioned to match Dai versions. At any point in time there is only one active version of WeiDai that corresponds to the active version of Dai. If you own an inactive version of WeiDai, you can still redeem it for the old Dai. MakerDAO issues special instructions for how to liquidate old Dai. You cannot use inactive versions of WeiDai to create new WeiDai but you can redeem it to 'escape' the old version."
	}]

interface FAQProps {
	classes?: any
}


function FAQ(props: FAQProps) {
	const classes = props.classes;
	const [expanded, setExpanded] = React.useState<string | false>(false);

	const handleChange = (panel: string) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => {
		setExpanded(isExpanded ? panel : false);
	};

	const Panels = () => {
		return questions.map(function (value, index) {
			const panel = "panel" + index
			return <ExpansionPanel expanded={expanded === panel} onChange={handleChange(panel)}>
				<ExpansionPanelSummary
					expandIcon={<ExpandMoreIcon />}
					aria-controls={`${panel}bh-content`}
					id={`${panel}bh-header`}
				>
					<Typography className={classes.heading}>{value.title}</Typography>
				</ExpansionPanelSummary>
				<ExpansionPanelDetails>
					<Typography>
						{value.answer}
					</Typography>
				</ExpansionPanelDetails>
			</ExpansionPanel>
		})
	}


	return <div className={classes.root}>
		<Grid container
			direction="column"
			alignItems="center"
			spacing={5}>
			<Grid item>
				<h2>Frequently Asked Questions</h2>
			</Grid>
			<Grid item>
				{Panels()}
			</Grid>
		</Grid>


	</div>;
}

export default withStyles(styleObject)(FAQ)