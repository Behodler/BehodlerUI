import * as React from 'react'
import { useState, useContext, useEffect, useCallback } from 'react'
import TradingBox from './TradingBox/index'
import PyroTokens, { basePyroPair, filterPredicate } from './PyroTokens/index'
import Sisyphus from './Sisyphus/index'
import ScarcityFaucet from './ScarcityFaucet/index'
import { Chip, Grid, Typography, Paper, MobileStepper, Button, Divider, Link } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { WalletContext } from "../../Contexts/WalletStatusContext"
import tokenListJSON from "../../../blockchain/behodlerUI/baseTokens.json"
import API from '../../../blockchain/ethereumAPI'
import { PyroToken } from 'src/blockchain/contractInterfaces/behodler/hephaestus/PyroToken'
import behodlerLogo from '../../../images/behodler/logo.png'
import blueGrey from '@material-ui/core/colors/blueGrey'
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import { useTheme } from '@material-ui/core/styles';
import steps from './SliderPanelInfo.json'
import { setBehodlerActiveStep, loadBehodlerActiveStep } from '../../../util/HTML5'
import { Variant } from '@material-ui/core/styles/createTypography';
type linkVariant = Variant | 'srOnly'

import two from '../../../images/behodler/landingPage/2.png'
import three from '../../../images/behodler/landingPage/3.png'
import four from '../../../images/behodler/landingPage/4.png'
import five from '../../../images/behodler/landingPage/5.png'
import six from '../../../images/behodler/landingPage/6.png'

interface props {
    connected: boolean
}

const images = [
    behodlerLogo, two, three, four, five, six
]

const useStyles = makeStyles({
    root: {
        flexGrow: 1,
    },
    tabs: {
        marginBottom: '20px'
    },
    betaRisk: {
        backgroundColor: "rgba(63, 81, 181, 0.8)",
        color: 'rgba(255,240,255,0.8)',
        marginBottom: '20px'

    }, Paper: {
        margin: "50px",
        maxWidth: "1000px",
        padding: "20px",
        backgroundColor: blueGrey['600'],
    },
    Grid: {
        minHeight: "700px",
        with: "100%",

    },
    divider: {
        marginBottom: "20px"
    },
    image: {
        height: "300px"
    },
    behodlerHeading: {

    },
    link: {
        fontStyle: "italic"
    }
});


export default function Swap(props: props) {
    const walletContextProps = useContext(WalletContext)
    const [currentStep, setCurrentStep] = useState<number>(loadBehodlerActiveStep)
    const incrementStep = (increment: number) => {
        let newStep: number = (currentStep + increment) % steps.length;
        setCurrentStep(newStep)
        setBehodlerActiveStep(newStep)
    }

    const [pyroTokenMapping, setPyroTokenMapping] = useState<basePyroPair[]>([])
    const tokenList: any[] = props.connected ? tokenListJSON[walletContextProps.networkName].filter(filterPredicate) : []
    const primaryOptions = { from: walletContextProps.account }

    const fetchPyroTokenDetails = async (baseToken: string): Promise<basePyroPair> => {
        const pyroAddress = await walletContextProps.contracts.behodler.PyroTokenRegistry.baseTokenMapping(baseToken).call(primaryOptions)
        const token: PyroToken = await API.getPyroToken(pyroAddress, walletContextProps.networkName)
        const name = await token.name().call(primaryOptions)
        return {
            name,
            base: baseToken,
            pyro: pyroAddress
        }
    }

    const pytoTokenPopulator = useCallback(async () => {
        let mapping: basePyroPair[] = []
        for (let i = 0; i < tokenList.length; i++) {
            mapping.push(await fetchPyroTokenDetails(tokenList[i].address))
        }
        setPyroTokenMapping(mapping)
    }, [walletContextProps.networkName])

    useEffect(() => {
        if (props.connected) {
            pytoTokenPopulator()
        }
    }, [props.connected])

    const classes = useStyles();
    const [value, setValue] = useState(0);
    const [showChip, setShowChip] = useState<boolean>(true)

    const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        setValue(newValue);
    };

    const hideChip = () => setShowChip(false)

    const theme = useTheme();
    const SectionBreak = () => <Divider className={classes.divider} />

    const logoVisible = props.connected
    const infoPanelVisible = value < 2

    return <div> <Grid
        container
        direction="column"
        justify="center"
        alignItems="center"
        spacing={2}
        className={classes.root}>
        {showChip && props.connected ? <Grid
            container
            direction="row"
            justify="center"
            alignItems="center"
        ><Grid item>
            </Grid>
            <Grid item>
                <Chip className={classes.betaRisk} label="This section is in beta. Use at your own risk." onDelete={hideChip} variant="outlined" />
            </Grid>
        </Grid> : ""}
        {logoVisible ? <Grid item>
            <img src={behodlerLogo} width="300" />
        </Grid> : ""
        }
        <Grid item>
            <Grid
                container
                direction="row"
                justify="center"
                alignItems="center"
            >
                <Grid item>
                    <Typography variant="h4" className={classes.behodlerHeading}>
                        Behodler Liquidity Protocol
            </Typography>
                </Grid>
            </Grid>
        </Grid>
        <Grid item>
            {props.connected ?
                <div>
                    <Tabs
                        value={value}
                        onChange={handleChange}
                        indicatorColor="primary"
                        centered
                        className={classes.tabs}
                    >
                        <Tab label="Swap" />
                        <Tab label="Pyrotokens" />
                        <Tab label="Sisyphus" />
                        <Tab label="Scarcity Faucet" />
                    </Tabs>


                    <RenderScreen value={value} tokens={pyroTokenMapping} />
                </div>
                : ""}
        </Grid>
        <Grid item>

        </Grid>
    </Grid>
        {infoPanelVisible ? <Grid container
            direction="column"
            justify="flex-start"
            alignItems="center"
            spacing={0}>
            <Paper className={classes.Paper}>
                <Grid container
                    direction="column"
                    justify="flex-start"
                    alignItems="center"
                    spacing={2}
                    className={classes.Grid}>
                    <Grid item>
                        <img src={images[currentStep]} className={classes.image} />
                    </Grid>
                    <Grid item>
                        <Typography variant="h5">
                            <BuildLink step={steps[currentStep]} currentLocation="heading" linkVariant="h5" />
                        </Typography>
                        <SectionBreak />
                    </Grid>
                    <Grid item>
                        <Typography variant="body1">
                            <BuildLink step={steps[currentStep]} currentLocation="subtitle" linkVariant="body1" />
                        </Typography>
                        <SectionBreak />
                    </Grid>
                    <Grid item>
                        <Typography variant="subtitle2">
                            <BuildLink step={steps[currentStep]} currentLocation="message" linkVariant="subtitle2" />
                        </Typography>
                        <SectionBreak />
                    </Grid>
                    <Grid item>
                        <Typography variant="subtitle2">
                            <BuildLink step={steps[currentStep]} currentLocation="message2" linkVariant="subtitle2" />
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
            : ""}
    </div>
}

function RenderScreen(props: { value: number, tokens: basePyroPair[] }) {
    switch (props.value) {
        case 0:
            return <TradingBox />
        case 1:
            if (props.tokens.length > 0)
                return <PyroTokens tokens={props.tokens} />
            return <div></div>
        case 2:
            return <Sisyphus />
        case 3:
            return <ScarcityFaucet />
        default:
            return <div>Chronos</div>
    }
}

interface stepStructure {

    heading: string
    subtitle: string
    message: string
    message2: string
    LinkURL?: string
    LinkLocation?: string
}

interface buildLinkProps {
    step: stepStructure
    currentLocation: string
    linkVariant: linkVariant
}

function BuildLink(props: buildLinkProps) {
    const classes = useStyles();
    const text = props.step[props.currentLocation]
    if (!props.step.LinkLocation || props.step.LinkLocation != props.currentLocation) {
        return props.step[props.currentLocation]
    }
    const linkStart = text.indexOf('{')
    const linkEnd = text.indexOf('}')

    const start = text.substring(0, linkStart)
    const linkText = text.substring(linkStart + 1, linkEnd)
    const end = text.substring(linkEnd + 1)

    return <div>{start}<Link className={classes.link} component="button" color="textPrimary" variant={props.linkVariant} onClick={() => window.open(props.step.LinkURL || '#', '_blank')}>{linkText}</Link>{end}</div>
}