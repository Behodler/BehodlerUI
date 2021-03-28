<<<<<<< HEAD
import * as React from "react";
import { useState, useContext, useEffect, useCallback } from "react";
import TradingBox2 from "./TradingBox2/index";
import PyroTokens from "./PyroTokens/index";
import { basePyroPair, filterPredicate } from "./PyroTokens/index";
import { Box, Typography, Button, Container } from "@material-ui/core";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import { WalletContext } from "../../Contexts/WalletStatusContext";
import tokenListJSON from "../../../blockchain/behodlerUI/baseTokens.json";
import API from "../../../blockchain/ethereumAPI";
import alternateLogo from "../../../images/behodler/tradhodler.png";
import eyelogo from "../../../images/behodler/landingPage/behodlerLogo.png";
import TopMenu from "src/components/LayoutFrame/TopMenu";
import { Pyrotoken } from "../../../blockchain/contractInterfaces/behodler2/Pyrotoken";
import MetamaskGasWarning from "src/components/LayoutFrame/MetamaskGasWarning";
export type permittedRoutes =
    | "swap"
    | "liquidity"
    | "sisyphus"
    | "faucet"
    | "behodler/admin"
    | "governance"
    | "swap2"
    | "pyro";
=======
import * as React from 'react'
import { useState, useContext, useEffect, useCallback } from 'react'
import TradingBox2 from './TradingBox2/index'
import PyroTokens from './PyroTokens/index'
import { basePyroPair, filterPredicate } from './PyroTokens/index'
import LiquidityMining from './LiquidityMining/index'
import { Typography, Button, Container, Box } from '@material-ui/core'
import { createStyles, makeStyles } from '@material-ui/core/styles'
import { WalletContext } from '../../Contexts/WalletStatusContext'
import tokenListJSON from '../../../blockchain/behodlerUI/baseTokens.json'
import API from '../../../blockchain/ethereumAPI'
import alternateLogo from '../../../images/behodler/tradhodler.png'
import eyelogo from '../../../images/behodler/landingPage/EyeLogo.png'
import TopMenu from '../../LayoutFrame/TopMenu'
import Governance from '../Swap/Governance/index'
import { Pyrotoken } from '../../../blockchain/contractInterfaces/behodler2/Pyrotoken'
import MetamaskGasWarning from '../../LayoutFrame/MetamaskGasWarning'
export type permittedRoutes = 'swap' | 'liquidity' | 'sisyphus' | 'faucet' | 'behodler/admin' | 'governance' | 'swap2' | 'pyro'
>>>>>>> migrated to create-react-app, added hot reloading, and fixed icon size

interface props {
    connected: boolean
    route: permittedRoutes
    setRouteValue: (v: permittedRoutes) => void
    setShowMetamaskInstallPopup: (v: boolean) => void
}

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {},
        SwapRoot: {
            flexGrow: 1,
            margin: 0,
            paddingTop: 50,
        },
        SwapRootNotConnected: {
            flexGrow: 1,
            margin: 0,
        },
        noWalletContent: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '64px 16px 32px 16px',
        },
        behodlerHeading: {
            color: 'white',
            fontWeight: 'bold',
        },
        behodlerSubheading: {
            color: 'midnightblue',
            textTransform: 'uppercase',
            fontWeight: 'bold',
            fontStyle: 'italic',
        },
        alphadrop: {
            color: 'white',
            fontFamily: theme.typography.fontFamily,
            fontSize: theme.typography.h6.fontSize || '1.25rem',
            fontWeight: 'bold',
        },
        link: {
            fontStyle: 'italic',
        },
        connectButton: {
            margin: '20px 0 0 0',
        },
        warningText: {
            color: 'black',
            fontStyle: 'italic',
            maxWidth: 500,
            textAlign: 'center',
        },
        behodlerLogo: {
            width: '30%',
        },
        logoContainer: {
            textAlign: 'center',
            display: 'block',
        },
        headerText: {
            textAlign: 'center',
        },
        errorMessage: {
            color: theme.palette.secondary.main,
            textAlign: 'center',
        },
    })
)

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

    const fetchPyroTokenDetails = async (baseToken: string): Promise<basePyroPair | null> => {
        const pyroAddress = await walletContextProps.contracts.behodler.Behodler2.LiquidityReceiver.baseTokenMapping(
            baseToken
        ).call(primaryOptions);
        if (pyroAddress === "0x0000000000000000000000000000000000000000") return null;
        const token: Pyrotoken = await API.getPyroToken(pyroAddress, walletContextProps.networkName);
        const name = await token.symbol().call(primaryOptions); //bug

        return {
            name,
            base: baseToken,
            pyro: pyroAddress,
        }
    }

    const pyroTokenPopulator = useCallback(async () => {
        let mapping: basePyroPair[] = [];
        for (let i = 0; i < tokenList.length; i++) {
            const pyro = await fetchPyroTokenDetails(tokenList[i].address);
            if (pyro) mapping.push(pyro);
        }
        setPyroTokenMapping(mapping)
    }, [walletContextProps.networkName])

    useEffect(() => {
        if (props.connected) {
            pyroTokenPopulator();
        } else {
        }
    }, [props.connected])

    const classes = useStyles()
    const [showChip, setShowChip] = useState<boolean>(false)

    useEffect(() => {
        const lastHide = localStorage.getItem('lastBehodlerHide')
        if (lastHide) {
            const duration = parseInt(lastHide)
            const elapsed = new Date().getTime() - duration
            setShowChip(elapsed > 604800000) //604800000 = 1 week
        } else setShowChip(true)
    }, [showChip])

    const truncAccount = walletContextProps.account.substring(0, 6) + '...' + walletContextProps.account.substring(walletContextProps.account.length - 4)

    return (
        <Box className={classes.root}>
            {props.connected ? (
                <>
<<<<<<< HEAD
                    <TopMenu
                        setRouteValue={props.setRouteValue}
                        ethBalance={ethBalance}
                        truncAccount={truncAccount}
                    />
=======
                    <TopMenu setRouteValue={props.setRouteValue} ethBalance={ethBalance} truncAccount={truncAccount} admin={walletContextProps.isMelkor} />
>>>>>>> migrated to create-react-app, added hot reloading, and fixed icon size
                    <MetamaskGasWarning />
                    <Box className={classes.headerText} mt={6}>
                        <div className={classes.alphadrop}>Swap, Own and Queue for Liquidity</div>
                        <Typography variant="h4" className={classes.behodlerHeading}>
                            Behodler Liquidity Market
                        </Typography>
                    </Box>
                    <Box>
                        <RenderScreen value={props.route} tokens={pyroTokenMapping} />
                    </Box>
                </>
            ) : (
                <Box className={classes.noWalletContent}>
                    <Box>
                        <img src={eyelogo} />
                    </Box>
                    <Box mt={3}>
                        <Button
                            className={classes.connectButton}
                            color="primary"
                            variant="outlined"
                            onClick={async () => {
                                walletContextProps.isMetamask ? walletContextProps.connectAction.action() : props.setShowMetamaskInstallPopup(true)
                            }}
                        >
                            Connect Your Wallet
                        </Button>
                    </Box>
                    {walletContextProps.error ? (
                        <Box className={classes.errorMessage} mt={2}>
                            Behodler cannot connect to your wallet!
                            <br />
                            Make sure your wallet is in Ethereum network!
                        </Box>
                    ) : (
                        ''
                    )}
                    <Box mt={3}>
                        <Typography className={classes.warningText} variant="subtitle1">
                            Behodler is a suite of liquidity management tools for the discerning DeFi connoisseur. Swap tokens cheaply with logarithmic bonding curves.
                            Gain exposure to the entire pool of liquidity by minting Scarcity. Tap into the liquidity growth of a single token by minting a Pyrotoken
                            wrapper. Exploit price arbitrage with a zero fee, low gas flashloan or let your tokens work for you passively by queuing for liquidity in the
                            Liquid Queue (coming soon). While you wait in the queue, we pay you Eye on an hourly basis. The more spots in the queue you occupy, the more
                            Eye you earn per hour.
                        </Typography>
                    </Box>
                    <Box mt={3}>
                        <Container className={classes.logoContainer}>
                            <img src={alternateLogo} className={classes.behodlerLogo} />
                        </Container>
                    </Box>
                </Box>
            )}
        </Box>
    )
}

function RenderScreen(props: { value: permittedRoutes; tokens: basePyroPair[] }) {
    switch (props.value) {
        case 'swap2':
            return <TradingBox2 />
<<<<<<< HEAD
        case 'pyro':
            if (props.tokens.length > 1)
                return <PyroTokens tokens={props.tokens} />
=======
        case 'liquidity':
            return <LiquidityMining />
        case 'governance':
            return <Governance />
        case 'pyro':
            if (props.tokens.length > 1) return <PyroTokens tokens={props.tokens} />
>>>>>>> migrated to create-react-app, added hot reloading, and fixed icon size
            return <Typography variant="subtitle1">fetching pyrotoken mapping from the blockchain...</Typography>
        default:
            return <div>Chronos</div>
    }
}
