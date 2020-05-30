import * as React from 'react'
import { useState } from 'react'
import { useTheme, withStyles } from '@material-ui/core/styles';
import { Grid, Paper, Typography, MobileStepper, Divider } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import blueGrey from '@material-ui/core/colors/blueGrey'
import daiEggEggWeidai from '../../images/home/daiEggEggWeidai.png'
import daiToWeiDai from '../../images/home/daiToWeiDai.png'
import metaWeiDai from '../../images/home/metamask+weidai+dai.png'
import ringOfFire from '../../images/home/ringOfFire.png'
import weiDai from '../../images/home/weidai.png'
import piggybank from '../../images/home/weidai+fire=piggybank.png'


import { setHomeActiveStep, loadHomeActiveStep } from '../../util/HTML5'
const images = [
	weiDai, daiToWeiDai, piggybank, daiEggEggWeidai, ringOfFire, metaWeiDai
]

const steps = [
	{
		heading: 'What is WeiDai?',
		subtitle: 'WeiDai is a new type of stablecoin: a thriftcoin. A thriftcoin is the perfect token for savers who also dislike short term price volatility.',
		message: "Preserving wealth in volatile markets with price inflation shouldn't require a masters degree in finance. It should be something anyone can do.",
		message2: "A thriftcoin is designed to bring back the days of piggy banks and money-under-the-mattress habits. It's a simple way for the unbanked and the risk-averse to save while still beating inflation.",
	},
	{
		heading: "How does WeiDai work?",
		subtitle: "Every unit of WeiDai is backed by MakerDAO's Dai stablecoin, held in a smart contract. WeiDai can be redeemed at any time for Dai according to the 'redeem rate' set by the reserve smart contract. WeiDai can also be issued at the prevailing redeem rate by putting Dai in the reserve contract. You can think of the redeem rate as the PRICE of WeiDai",
		message: "The redeem rate is simply the number of Dai held in reserve divided by the number of WeiDai in circulation. A higher redeem rate requires more Dai for every unit of WeiDai created and gives you more Dai for every unit of WeiDai redeemed. ",
		message2: "WeiDai tokens can also be burnt. Burning just deletes tokens from supply without affecting Dai in reserve. This causes the redeem rate to go up!"
	},
	{
		heading: "What makes WeiDai a Thriftcoin?",
		subtitle: "WeiDai is backed by Dai which is stored in the Dai savings contract so its value grows at least as fast as the Dai Savings Rate (DSR). In addition to the DSR, burning WeiDai makes the redeem rate go up.",
		message: "If WeiDai is burnt with enough regularity, the price of WeiDai (the redeem rate) will rise faster than the inflation rate of the US dollar. We call this 'thrift escape velocity'.",
		message2: "After thrift escape velocity, WeiDai transitions from a stablecoin into a thriftcoin."
	},
	{
		heading: "But why would anyone burn WeiDai?",
		subtitle: "Most cryptocurrencies mine work. WeiDai mines patience. To create WeiDai, you send Dai to a smart contract called the Patience Regulation Engine. There your WeiDai incubates for a set number of blocks",
		message: "At any point during incubation, you can claim your WeiDai but you will suffer a penalty fee for not being patient. The earlier in incubation you claim, the bigger the penalty. The penalty is burnt, pushing up the WeiDai redeem rate.",
		message2: "If buyers find waiting easy, the incubation duration is automatically lengthened until people start claiming early. Conversely if too many people claim early, the incubation period is reduced. The incubation period is the 'mining difficulty' of WeiDai."
	},
	{
		heading: "Are there any other incentives to burn?",
		subtitle: "Whenever WeiDai is redeemed for Dai, 2% is burnt in order to push up the redeem rate. This is another way patience is rewarded: those who redeem sooner push the redeem rate up for those who hold.",
		message: "Beyond these two principle burn incentives, a whole ecosystem is planned around WeiDai with as much mutually beneficial burning as possible. For instance, a merchant who holds a large portion of WeiDai can sell to customers by burning the customer's tokens instead of taking them, rewarding both themselves and the whole WeiDai community.",
		message2: "WeiDai is completely managed on the Ethereum Blockchain by smart contracts so if you're an interested developer, you can immediately plug in to the smart contracts and build your own thriftcoin powered #DeFi killer Dapp without requiring permission. WeiDai is entirely open source."
	},
	{
		heading: "How do I start?",
		subtitle: "Head over to the Patience Regulation Engine by clicking the navigation button labelled 'Create / Claim'. Once you've enabled Dai, you can create new WeiDai by clicking Create. Metamask will popup whenever you interact with a smart contract.",
		message: "Your newly created WeiDai will first have to incubate. A progress bar will tell you how big the penalty for claiming early will be. For instance, if the bar is at 80 when you claim, you'll only get 20% of the created WeiDai. The rest is burnt. When the progress bar reaches zero, your WeiDai is ready to be claimed without penalty.",
		message2: "If you want to redeem, click on the 'Redeem for Dai' navigation button to see the WeiDai reserve. Enter the amount you'd like to redeem. Bear in mind that there's a 2% redemption fee so try to wait until the redeem rate has risen by at least 2% before claiming. Have fun and may Vitalik smile upon your thriftiness."
	}
]

interface HomeProps {
	classes?: any
}

const styles = {
	Paper: {
		maxWidth: "500px",
		padding: "20px",
		backgroundColor: blueGrey['600'],
	},
	Grid: {
		minHeight: "600px",

	},
	divider: {
		marginBottom: "20px"
	},
	image: {
		height: "100px"
	}
}



function Home(props: HomeProps) {
	const [currentStep, setCurrentStep] = useState<number>(loadHomeActiveStep)
	const incrementStep = (increment: number) => {
		let newStep: number = (currentStep + increment) % steps.length;
		setCurrentStep(newStep)
		setHomeActiveStep(newStep)
	}

	const theme = useTheme();

	const SectionBreak = () => <Divider className={props.classes.divider} />

	return (
		<Grid container
			direction="column"
			justify="flex-start"
			alignItems="center"
			spacing={0}>
			<Paper className={props.classes.Paper}>
				<Grid container
					direction="column"
					justify="flex-start"
					alignItems="center"
					spacing={2}
					className={props.classes.Grid}>
					<Grid item>
						<img src={images[currentStep]} className={props.classes.image} />
					</Grid>
					<Grid item>
						<Typography variant="h5">
							{steps[currentStep].heading}
						</Typography>
						<SectionBreak />
					</Grid>
					<Grid item>
						<Typography variant="body1">
							{steps[currentStep].subtitle}
						</Typography>
						<SectionBreak />
					</Grid>
					<Grid item>
						<Typography variant="subtitle2">
							{steps[currentStep].message}
						</Typography>
						<SectionBreak />
					</Grid>
					<Grid item>
						<Typography variant="subtitle2">
							{steps[currentStep].message2}
						</Typography>
					</Grid>
				</Grid>
				<MobileStepper steps={steps.length} position="static" variant="text" activeStep={currentStep}
					nextButton={
						<Button size="small" onClick={() => incrementStep(1)} disabled={currentStep == steps.length - 1}>
							Next
            			{theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
						</Button>
					}
					backButton={
						<Button size="small" onClick={() => incrementStep(-1)} disabled={currentStep === 0}>
							{theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
							Back
					</Button>
					}
				/>
			</Paper>
		</Grid>
	)
}

export default withStyles(styles)(Home)