import * as React from 'react'
import { useState, useContext, useEffect, useCallback } from 'react'
import TradingBox2 from './TradingBox2/index'
import PyroTokens from './PyroTokens/index'
import { basePyroPair, filterPredicate } from './PyroTokens/index'
import LiquidityMining from './LiquidityMining/index'
import { Grid, Typography, Button, Container } from '@material-ui/core'
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { WalletContext } from "../../Contexts/WalletStatusContext"
import tokenListJSON from "../../../blockchain/behodlerUI/baseTokens.json"
import API from '../../../blockchain/ethereumAPI'
import behodlerLogo from '../../../images/behodler/logo.png'
import eyelogo from '../../../images/behodler/landingPage/EyeLogo.png'
import blueGrey from '@material-ui/core/colors/blueGrey'
import TopMenu from 'src/components/LayoutFrame/TopMenu'
import Governance from '../Swap/Governance/index'
import { Pyrotoken } from '../../../blockchain/contractInterfaces/behodler2/Pyrotoken'
export type permittedRoutes = 'swap' | 'liquidity' | 'sisyphus' | 'faucet' | 'behodler/admin' | 'governance' | 'swap2' | 'pyro'

interface props {
    connected: boolean
    route: permittedRoutes
    setRouteValue: (v: permittedRoutes) => void
    setShowMetamaskInstallPopup: (v: boolean) => void
}

const useStyles = makeStyles(theme => createStyles({
    SwapRoot: {
        flexGrow: 1,
        margin: 0,
        marginTop: -100,
        paddingTop: 150,
        backgroundRepeat: 'no-repeat',
        backgroundColor: 'transparent',
        backgroundSize: 'cover',
        width: '100% !important'
    },
    SwapRootNotConnected: {
        flexGrow: 1,
        margin: 0,
        width: '100% !important'
    },
    tabs: {
        marginBottom: '20px'
    }, Paper: {
        margin: "50px",
        padding: "20px",
        backgroundColor: blueGrey['600'],
    },
    traderContainer: {
        margin: "50px",
        padding: "20px",
        backgroundColor: 'rgba(255,255,255,0.93)',
        borderRadius: 20,
        height: '100%',
        minHeight: 390,
        boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)'
    },
    Grid: {
        minHeight: "700px",
        with: "100%",

    },
    divider: {
        marginBottom: "20px"
    },
    image: {
        height: "250px"
    },
    behodlerHeading: {
        color: 'white',
        fontWeight: 'bold'
    },
    behodlerSubheading: {
        color: 'midnightblue',
        textTransform: 'uppercase',
        fontWeight: 'bold',
        fontStyle: 'italic'
    },
    link: {
        fontStyle: "italic"
    },
    connectButton: {
        margin: "20px 0 0 0"
    },
    warningText: {
        color: 'black',
        fontStyle: 'italic',
        maxWidth: 500,
        textAlign: 'center',
    },
    alphadrop: {
        color: 'white',
        fontFamily: theme.typography.fontFamily,
        fontSize: theme.typography.h6.fontSize || '1.25rem',
        fontWeight: 'bold'
    },
    alphadropLink: {
        fontFamily: theme.typography.fontFamily,
        fontSize: theme.typography.h6.fontSize || '1.25rem'
    }, behodlerLogo: {
        width: '30%',

    },
    logoContainer: {
        textAlign: "center",
        display: "block"
    },
    nopadding: {
        padding: 0
    }
}));

export default function Swap(props: props) {
    const walletContextProps = useContext(WalletContext)
    const [ethBalance, setEthBalance] = useState<string>('')
    const [pyroTokenMapping, setPyroTokenMapping] = useState<basePyroPair[]>([])
    const tokenList: any[] = props.connected ? tokenListJSON[walletContextProps.networkName].filter(filterPredicate) : []
    const primaryOptions = { from: walletContextProps.account }
    const ethCallback = useCallback(async () => {
        if (walletContextProps.connected && walletContextProps.account.length > 5) {
            setEthBalance(API.fromWei(await API.getEthBalance(walletContextProps.account)))
        }
    }, [walletContextProps.account, walletContextProps.connected])

    useEffect(() => {
        ethCallback()
    })


    const fetchPyroTokenDetails = async (baseToken: string): Promise<basePyroPair|null> => {
        const pyroAddress = await walletContextProps.contracts.behodler.Behodler2.LiquidityReceiver.baseTokenMapping(baseToken).call(primaryOptions)
        if (pyroAddress === '0x0000000000000000000000000000000000000000')
            return null
        const token: Pyrotoken = await API.getPyroToken(pyroAddress, walletContextProps.networkName)
        const name = await token.symbol().call(primaryOptions)//bug

        return {
            name,
            base: baseToken,
            pyro: pyroAddress
        }
    }

    const pyroTokenPopulator = useCallback(async () => {
        let mapping: basePyroPair[] = []
        for (let i = 0; i < tokenList.length; i++) {
            const pyro = await fetchPyroTokenDetails(tokenList[i].address)
            if (pyro)
                mapping.push(pyro)
        }
        setPyroTokenMapping(mapping)
    }, [walletContextProps.networkName])

    useEffect(() => {
        if (props.connected) {
            pyroTokenPopulator()
        }
        else {
        }
    }, [props.connected])

    const classes = useStyles();
    const [showChip, setShowChip] = useState<boolean>(false)

    useEffect(() => {
        const lastHide = localStorage.getItem('lastBehodlerHide')
        if (lastHide) {
            const duration = parseInt(lastHide)
            const elapsed = new Date().getTime() - duration
            setShowChip(elapsed > 604800000)//604800000 = 1 week
        } else
            setShowChip(true)
    }, [showChip])

    const logoVisible = !props.connected
    const truncAccount = walletContextProps.account.substring(0, 6) + '...' + walletContextProps.account.substring(walletContextProps.account.length - 4)

    const DepaddedGridItem = (props: { children: any }) => <Grid className={classes.nopadding} item>{props.children}</Grid>
    return <div>
        {logoVisible ? '' : <TopMenu setRouteValue={props.setRouteValue} ethBalance={ethBalance} truncAccount={truncAccount} admin={walletContextProps.isMelkor} />}
        <Grid
            container
            direction="column"
            justify="space-around"
            alignItems="center"
            spacing={6}
            className={props.connected ? classes.SwapRoot : classes.SwapRootNotConnected}>
            {showChip && props.connected ? <Grid
                container
                direction="row"
                justify="center"
                alignItems="center"
            >
            </Grid> : ""}
            {logoVisible ?
                <DepaddedGridItem>
                    <img src={eyelogo} />
                </DepaddedGridItem>
                : ''}
            {logoVisible ? <DepaddedGridItem>
                <Button className={classes.connectButton} color="primary" variant="outlined" onClick={async () => {
                    walletContextProps.isMetamask ? walletContextProps.connectAction.action() : props.setShowMetamaskInstallPopup(true)
                }}>Connect Your Wallet</Button>
            </DepaddedGridItem> : ''}
            {logoVisible ?
                <DepaddedGridItem>
                    <Typography className={classes.warningText} variant='subtitle1'>
                        Behodler is a suite of liquidity management tools for the discerning DeFi connoisseur. Swap tokens cheaply with logarithmic bonding curves.
                        Gain exposure to the entire pool of liquidity by minting Scarcity. Tap into the liquidity growth of a single token by minting a Pyrotoken wrapper.
                        Exploit price arbitrage with a zero fee, low gas flashloan or let your tokens work for you passively by queuing for liquidity in the Liquid Queue (coming soon).
                        While you wait in the queue, we pay you Eye on an hourly basis. The more spots in the queue you occupy, the more Eye you earn per hour.
            </Typography>
                </DepaddedGridItem>
                : ''}
            {logoVisible ? <DepaddedGridItem>
                <Container className={classes.logoContainer} >
                    <img src={behodlerLogo} className={classes.behodlerLogo} />
                </Container>
            </DepaddedGridItem> : ''}
            <DepaddedGridItem>
                {logoVisible ? '' :
                    <Grid
                        container
                        direction="row"
                        justify="center"
                        alignItems="center"
                    >
                        <Grid item>
                            <Typography variant="h4" className={classes.behodlerHeading}>
                                Behodler Liquidity Engine
            </Typography>
                        </Grid>
                    </Grid>
                }
            </DepaddedGridItem>
            {props.connected ? <Grid
                container
                direction="row"
                justify="center"
                alignItems="center"
            >
                <Grid item>
                    <div className={classes.alphadrop}>
                        Swap, Own and Queue for Liquidity
                    </div>
                </Grid>
            </Grid>
                : ''}
            {props.connected ?
                <DepaddedGridItem>

                    <div className={classes.traderContainer}>
                        <Grid
                            container
                            direction="column"
                            justify="space-between"
                            alignItems="center"
                            spacing={3}
                        >
                            <Grid item>
                                <RenderScreen value={props.route} tokens={pyroTokenMapping} />
                            </Grid>
                        </Grid>
                    </div>
                </DepaddedGridItem>
                : ""}
        </Grid>
    </div>
}

function RenderScreen(props: { value: permittedRoutes, tokens: basePyroPair[] }) {
    switch (props.value) {
        case 'swap2':
            return <TradingBox2 />
        case 'liquidity':
            return <LiquidityMining />
        case 'governance':

            return <Governance />
        case 'pyro':
            if (props.tokens.length > 1)
                return <PyroTokens tokens={props.tokens} />
            return <Typography variant="subtitle1">fetching pyrotoken mapping from the blockchain...</Typography>
        default:
            return <div>Chronos</div>
    }
}