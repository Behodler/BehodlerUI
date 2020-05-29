import * as React from 'react'
import { useState, useContext, useEffect, useCallback } from 'react'
import TradingBox from './TradingBox/index'
import PyroTokens, { basePyroPair, filterPredicate } from './PyroTokens/index'
import Sisyphus from './Sisyphus/index'
import ScarcityFaucet from './ScarcityFaucet/index'
import { Chip, Grid, Typography, ExpansionPanel, ExpansionPanelSummary, ExpansionPanelDetails, Paper, MobileStepper, Button, Divider, Container } from '@material-ui/core'
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

interface props {
    connected: boolean
}

const useStyles = makeStyles({
    root: {
        flexGrow: 1,
    },
    tabs: {
        marginBottom: '20px'
    }, betaRisk: {
        backgroundColor: "rgba(63, 81, 181, 0.8)",
        color: 'rgba(255,240,255,0.8)',
        marginBottom: '20px'

    }, Paper: {
        with: "100%",
        padding: "20px",
        backgroundColor: blueGrey['600'],
    },
    Grid: {
        minHeight: "600px",
        with: "100%",
    },
    divider: {
        marginBottom: "20px"
    },
    image: {
        height: "100px"
    }
});


export default function Swap(props: props) {

    const walletContextProps = useContext(WalletContext)
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

    return <div> <Grid
        container
        direction="column"
        justify="center"
        alignItems="center"
        spacing={2}
        className={classes.root}>
        <Grid item>
            <img src={behodlerLogo} width="300" />
        </Grid>
        <Grid item>
            <Grid
                container
                direction="row"
                justify="center"
                alignItems="center"
            >
                <Grid item>
                    <Typography variant="h4">
                        Behodler Liquidity Protocol
            </Typography>
                </Grid>
            </Grid>
        </Grid>
        <Grid item>
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
        <ExpansionPanel expanded={true}>
            <ExpansionPanelSummary>
                <Container> <Typography variant="h5">What is Behodler?</Typography></Container>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
                <Grid container
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
                                {/* <img src={images[currentStep]} className={props.classes.image} /> */}
                            </Grid>
                            <Grid item>
                                <Typography variant="h5">
                                    Behodler is a liquidity protocol bla bla
                                    {/* {steps[currentStep].heading} */}
                                </Typography>
                                <SectionBreak />
                            </Grid>
                            <Grid item>
                                <Typography variant="body1">
                                    {/* {steps[currentStep].subtitle} */}
                                </Typography>
                                <SectionBreak />
                            </Grid>
                            <Grid item>
                                <Typography variant="subtitle2">
                                    {/* {steps[currentStep].message} */}
                                </Typography>
                                <SectionBreak />
                            </Grid>
                            <Grid item>
                                <Typography variant="subtitle2">
                                    {/* {steps[currentStep].message2} */}
                                </Typography>
                            </Grid>
                        </Grid>
                        <MobileStepper steps={3} position="static" variant="text" activeStep={2}
                            nextButton={
                                <Button size="small" onClick={() => { }} disabled={false}>
                                    Next
               {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
                                </Button>
                            }
                            backButton={
                                <Button size="small" onClick={() => { }} disabled={false}>
                                    {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
                   Back
           </Button>
                            }
                        />
                    </Paper>
                </Grid>
            </ExpansionPanelDetails>
        </ExpansionPanel>
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