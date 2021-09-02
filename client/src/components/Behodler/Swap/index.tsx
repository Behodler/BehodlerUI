import * as React from 'react'
import { useState, useContext, useEffect, useCallback } from 'react'
import TradingBox3 from './TradingBox3'
import PyroTokens from './PyroTokens/index'
import { basePyroPair, filterPredicate } from './PyroTokens/index'
import { Typography, Button, Container, Box, makeStyles, createStyles } from '@material-ui/core'
import { WalletContext, WalletError } from '../../Contexts/WalletStatusContext'
import tokenListJSON from '../../../blockchain/behodlerUI/baseTokens.json'
import API from '../../../blockchain/ethereumAPI'
import alternateLogo from '../../../images/behodler/tradhodler.png'
import eyelogo from '../../../images/behodler/landingPage/behodlerLogo.png'
import { Pyrotoken } from '../../../blockchain/contractInterfaces/behodler2/Pyrotoken'
export type permittedRoutes = 'swap' | 'liquidity' | 'sisyphus' | 'faucet' | 'behodler/admin' | 'governance' | 'swap2' | 'pyro'

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
    eyeLogo:{
        width:400,
        margin: '0 -20px -60px 0'
    },
        errorMessage: {
            color: theme.palette.secondary.main,
            textAlign: 'center',
        },
        
    })
)

const getMessageError = (walletError: WalletError): any => {
    switch (walletError) {
        case WalletError.NETWORK_NOT_SUPPORTED:
            return <>Your wallet's network is currently not supported!<br/>Please make sure it is Ethereum Mainnet</>
        default: 
            return ''
    }
}

export default function Swap(props: props) {
    const walletContextProps = useContext(WalletContext)
    const [pyroTokenMapping, setPyroTokenMapping] = useState<basePyroPair[]>([])
    const tokenList: any[] = props.connected ? tokenListJSON[walletContextProps.networkName].filter(filterPredicate) : []
    const primaryOptions = { from: walletContextProps.account }

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

    return (
        <Box className={classes.root}>
            {props.connected ? (
                <>
                    <Box>
                        <RenderScreen value={props.route} tokens={pyroTokenMapping} />
                    </Box>
                </>
            ) : (
                <Box className={classes.noWalletContent}>
                    <Box>
                    <img src={eyelogo} className={classes.eyeLogo} />
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
                    {walletContextProps.walletError ? (
                        <Box className={classes.errorMessage} mt={2}>
                            {getMessageError(walletContextProps.walletError)}
                        </Box>
                    ) : (
                        ''
                    )}
                    <Box mt={3}>
                        <Typography className={classes.warningText} variant="subtitle1">
                        Behodler is a suite of liquidity management tools for the discerning DeFi connoisseur. Swap tokens cheaply with logarithmic bonding curves or
                        gain exposure to the entire pool of liquidity by minting Scarcity.
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
            return <TradingBox3 />
        case 'pyro':
            if (props.tokens.length > 1)
                return <PyroTokens tokens={props.tokens} />
            return <Typography variant="subtitle1">fetching pyrotoken mapping from the blockchain...</Typography>
        default:
            return <div>Chronos</div>
    }
}
