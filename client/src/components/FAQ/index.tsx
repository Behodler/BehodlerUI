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
		title: "Did the creator of WeiDai give himself free tokens?",
		answer: "No, every WeiDai in existence is 100% backed by Dai. The only can only benefit from voluntary donations."
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
		title: "WeiDai is taking really long to load. What's going on?",
		answer: "Currently Metamask slows down with regular use. This is a known issue and out of our hands, for now unfortunately. The best solution is to disable and enable the Metamask extension or to restart your browser."
	},
	{
		title: "How often is the incubation duration adjusted?",
		answer: "The Patience Regulation Engine allows for 10 incubation durations worth of blocks to pass before adjusting the difficulty. This is the adjustment cycle. For instance, if the incubation duration is 40 blocks then 800 blocks pass before the duration is either halved or doubled."
	},
	{
		title: "Is there a minimum duration for which WeiDai can be incubated?",
		answer: "Yes. Because the penalty for early withdrawal is adjusted in 5% point decrements, the minimum possible incubation duration is 20 blocks."
	},
	{
		title: "What if everyone is patient? Is there an upper limit to how long it takes to incubate?",
		answer: "There's no practical limit but it can't surpass 2^255 blocks because of EVM limits. However if the average block time is 15 seconds, that would have you waiting until the universe is populated with only supermassive black holes."
	},
	{
		title: "How does the Patience Regulation Engine (PRE) know 'how patient' people are?",
		answer: "At the end of a cycle (10 incubation durations worth of blocks), the PRE compares the WeiDai claimed early to the WeiDai claimed after incubation to figure out how patient users were. If more WeiDai is claimed early than left for full duration then the duration is considered 'too hard' and halved. Conversely if more is claimed after duration than early, it is considered too easy and doubled. In addition to this, the PRE can figure out how hard it was. To do this, it weights the claims by 'how early' they were claimed. Early claims are multiplied by the penalty expressed as a number between 0 and 100. So you claim 10 WeiDai when the penalty is 85% then you adjusted claim value is 850. If instead you claim when the penalty is 40% the adjusted claim value is 400. This means that people who claim very early and incur maximum penalty weight the PRE heavier in favour of impatience. The claims for those who wait the entire duration are multiplied by 100. At the end of a cycle, the PRE compares the two weighted totals to figure out whether to halve or double the duration."
	},
	{
		title: "20 duration periods have passed but the difficulty hasn't been adjusted.",
		answer: "Smart contracts on Ethereum cannot self execute at a given point in time. They lie dormant until used. The PRE adjusts the difficulty whenever someone claims WeiDai IF 20 incubation periods have passed. This means that if 40 pass without any claims, the duration remains unchanged. With increasing popularity of WeiDai, this discrepancy should fall away. There are tricks to guarantee regular adjustment but smart contracts should always be kept as simple as possible."
	},
	{
		title: "If most people are patient, can someone trick the Patience Regulation Engine with small purchases that are claimed early to keep the duration low?",
		answer: "To game the system, you would have to incur big penalties because the PRE weights early claims against patient claims. It also gives more weight to patient claims. A '51% attack' on WeiDai would also have the unintended consequence of pushing up the redeem rate so go ahead. Your sacrifice is appreciated."
	},
	{
		title: "Other cryptocurrencies have burning. How is WeiDai any different?",
		answer: "The tokens that currently have burning mechanisms are not collateralized by a reserve asset. Instead their price is set by supply and demand. When they burn, they reduce supply, hoping that users on exchanges will respond by bidding up the price. However, if demand also falls, the price may remain unchanged or even decrease. The WeiDai price reflects the supply and demand for Dai which itself reflects the supply and demand for the U.S. dollar. A change in the demand for WeiDai has no effect on its price. Instead when WeiDai is burnt, the global price (redeem rate) instantly rises without need for market activity."
	},
	{
		title: "If I send my WeiDai to the zero address, will the redeem rate rise?",
		answer: "The zero address (0x0000000000000000000000000000000000000000) is just a convention people use to send their tokens or ether out of circulation. It's still a valid address and someone may one day generate the private keys to it by coincidence and become very rich in the process. WeiDai's ERC20 contract is an implementation of OpenZeppelin's token contract. The code explicitly fails if you attempt to send WeiDai to the zero address."
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
		answer: "When I first started this project, the answer was 'yes'. But before I could launch, Compound launched their cDai token. For that reason, cDai is actually the first thriftcoin of which I know."
	},
	{
		title: "Is WeiDai in competition with cDai?",
		answer: "No way. All of us in the DeFi space are in this together. Whenever a new primitive is created, innovative developers find new ways to compose amazing products. For instance, pooltogether uses Compound to create the world's first lossless lottery. To answer the question, cDai is based on interest bearing instruments. WeiDai is based on burn incentives. They likely both have their role to play and I certainly will be a holder of both."
	},
	{
		title: "cDai creates wealth through interest markets. WeiDai just shuffles money around. Is WeiDai economically wasteful?",
		answer: "Every currency has distributional implications. Purchasing power always flows from one group to another. There's no currency that can settle into perfect equality even if the money were dumped in equal portions on every citizen. National currencies tend to redistribute purchasing power from the last recipients of newly printed money to the first recipients of money through inflation. Financial markets, and in particular a select few institutions, are the first recipients of new money. Suppose a fictional institution JTBorgan receives a billion new dollars. It wants to speculate on real estate and notices a a neighbourhood of houses with average prices of $800 000. It purchases half the houses in the area to rent out to tenants. The remaining house sellers notice a sudden spike in demand for houses and raise their price to $900 000. Before JTBorgen was given new money, you were interested in one of the houses. You were about to make an offer when the asking prices all rose. You agree to the new price but are $100k poorer than you would have been all because new money was printed and given to someone else before you. In order to not be a sucker next time, you'd have to preserve your wealth better. Traditionally the best way to do this would be to enter financial markets. You decide to purchase funds through JTBorgen. In this way, inflation has not only stolen wealth from you but enticed you to hand over money to the beneficiaries of it. In addition you are forced to read up and master financial markets which might not be your area of expertise. This wasted time could have been spent elsewhere. All the time lost to inflation reduces the division of labour in the economy by draining the mental resources of non financial workers. This is one way in which inflationary fiat currencies actually reduce productivity in the economy. These and other reasons are why Bitcoin was invented, to be a currency for savers. In Bitcoin the distributional direction is from spenders to HODLers. The longer you hold, the better off you are. The volatility of Bitcoin also disappears the longer you hold, allowing you to ignore financial market complexities and focus on what you're good at and enjoy. Unfortunately people who can afford to hold onto bitcoin for very long periods of time are usually pretty well off to start with. In developing countries like the one I'm from, incomes are low, inflation is high and credit is a lifeblood. Very few people have money to put away for long periods of time. I wanted a currency that preserves your wealth, regardless of the time period. Dai is perfect for short term savings but if you hold it for 4 years or more, you have to start reconsidering financial markets. WeiDai is designed with uncertainty in mind. You can hold onto it for 1 day or 10 years, certain that your wealth is either preserved or has grown. In this way, finance won't be your master. You can return to doing what you enjoy and are good at, and the economy will prosper as a result."
	},
	{
		title: "Are thriftcoins better than bitcoin?",
		answer: "Bitcoin and thriftcoins serve very different roles. Thriftcoins protect holders from short term volatility and long term inflation. Bitcoin offers no such protection but has the potential to explode in price as we all know. Bitcoin's biggest strength is its immutability of mission. That is, the creator has vanished, the blockchain is secure, the code is treated as sacrosanct and the 21 million limit will never be violated. Asteroids will be mined for gold before Bitcoin's scarcity is threatened."
	},
	{
		title: "What if a new version of Dai is released such as Multicol Dai?",
		answer: "WeiDai is versioned to match Dai versions. At any point in time there is only one active version of WeiDai that corresponds to the active version of Dai. If you own an inactive version of WeiDai, you can still redeem it for the old Dai. MakerDAO issues special instructions for how to liquidate old Dai. You cannot use inactive versions of WeiDai to create new WeiDai but you can redeem it to 'escape' the old version."
	},
	{
		title: "Why the name WeiDai?",
		answer: "Since WeiDai is a wrapper of Dai, I wanted the name to signal this. I also wanted the name to give a sense of how this wrapper is designed to protect wealth. At first, I chose UpDai because it was annoyingly catchy. Dai is a Chinese word for borrow/lend so to keep with the nomenclature, I went plumbing for suitable Chinese words on google translate and came across Wei which means guard or protect. It was more than perfect because Wei Dai is one of the big contributors to the foundations of Bitcoin. In fact, he's a potential Satoshi Candidate and he's the namesake for the smallest denomination of Ether. WeiDai thus means a guard or protection on Dai (from inflation) and is a homage to one of the founding fathers of cryptocurrency."
	}
]

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