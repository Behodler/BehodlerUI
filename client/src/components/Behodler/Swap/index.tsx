import * as React from 'react'
import { useState, useContext, useEffect, useCallback } from 'react'
import TradingBox2 from './TradingBox2/index'
import PyroTokens from './PyroTokens/index'
import { basePyroPair, filterPredicate } from './PyroTokens/index'
import { Typography, Button, Container, Box, makeStyles, createStyles } from '@material-ui/core'
import { WalletContext, WalletError } from '../../Contexts/WalletStatusContext'
import tokenListJSON from '../../../blockchain/behodlerUI/baseTokens.json'
import API from '../../../blockchain/ethereumAPI'
import alternateLogo from '../../../images/behodler/tradhodler.png'
import eyelogo from '../../../images/behodler/landingPage/behodlerLogo.png'
import TopMenu from '../../LayoutFrame/TopMenu'
import { Pyrotoken } from '../../../blockchain/contractInterfaces/behodler2/Pyrotoken'
export type permittedRoutes = 'swap' | 'liquidity' | 'sisyphus' | 'faucet' | 'behodler/admin' | 'governance' | 'swap2' | 'pyro'

interface props {
    connected: boolean
    route: permittedRoutes
    setRouteValue: (v: permittedRoutes) => void
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
            padding: '40px 16px',
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
        connectButtonWrapper: {
            margin: '20px 0 16px',
        },
        connectButton: {
            margin: '0',
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
        eyeLogoWrapper:{
            padding: '0 10px',
        },
        eyeLogo:{
            maxWidth: '380px',
            width: '100%',
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
            return <>
                The connection with your wallet couldn't be established.<br/>
                Please try again and make sure your wallet is configured to use Ethereum Mainnet network
            </>
    }
}

export default function Swap(props: props) {
    const walletContextProps = useContext(WalletContext)
    const classes = useStyles()

    const [ethBalance, setEthBalance] = useState<string>('')
    const [pyroTokenMapping, setPyroTokenMapping] = useState<basePyroPair[]>([])
    const [showChip, setShowChip] = useState<boolean>(false)

    const primaryOptions = { from: walletContextProps.account }
    const isAccountReady = walletContextProps.connected && walletContextProps.account.length > 5;
    const truncAccount = walletContextProps.account.substring(0, 6) + '...' + walletContextProps.account.substring(walletContextProps.account.length - 4)

    const ethCallback = useCallback(async () => {
        if (isAccountReady) {
            const weiBalance = await API.getEthBalance(walletContextProps.account)
            setEthBalance(API.fromWei(weiBalance))
        }
    }, [walletContextProps.account, isAccountReady])

    const fetchPyroTokenDetails = useCallback(async (baseToken: string): Promise<basePyroPair | null> => {
        const tokenMappings = walletContextProps.contracts.behodler.Behodler2.LiquidityReceiver.baseTokenMapping(
            baseToken
        );

        if (tokenMappings) {
            const pyroAddress = await tokenMappings.call(primaryOptions);
            if (pyroAddress === "0x0000000000000000000000000000000000000000") return null;
            const token: Pyrotoken = await API.getPyroToken(pyroAddress, walletContextProps.networkName);
            const name = await token.symbol().call(primaryOptions); //bug

            return {
                name,
                base: baseToken,
                pyro: pyroAddress,
            }
        }

        return null
    }, [walletContextProps.contracts, walletContextProps.networkName, primaryOptions])

    const pyroTokenPopulator = useCallback(async () => {
        if (isAccountReady && walletContextProps.networkName) {
            let mapping: basePyroPair[] = [];
            const tokenList: any[] = tokenListJSON[walletContextProps.networkName].filter(filterPredicate)

            for (let i = 0; i < tokenList.length; i++) {
                const pyro = await fetchPyroTokenDetails(tokenList[i].address);
                if (pyro) mapping.push(pyro);
            }
            setPyroTokenMapping(mapping)
        }
    }, [walletContextProps.networkName, isAccountReady])

    useEffect(() => {
        ethCallback()
    }, [walletContextProps.account, isAccountReady])

    useEffect(() => {
        if (isAccountReady) {
            pyroTokenPopulator()
        }
    }, [isAccountReady])

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
                    <TopMenu
                        setRouteValue={props.setRouteValue}
                        ethBalance={ethBalance}
                        truncAccount={truncAccount}
                    />
                    <Box className={classes.headerText} mt={6}>
                        <div className={classes.alphadrop}>Swap, Own and Queue for Liquidity</div>
                        <Typography variant="h4" className={classes.behodlerHeading}>
                            Behodler Liquidity Engine
                        </Typography>
                    </Box>
                    <Box>
                        <RenderScreen value={props.route} tokens={pyroTokenMapping} />
                    </Box>
                </>
            ) : (
                <Box className={classes.noWalletContent}>
                    <Box className={classes.eyeLogoWrapper}>
                        <img src={eyelogo} className={classes.eyeLogo} />
                    </Box>
                    <Box className={classes.connectButtonWrapper}>
                        <Button
                            className={classes.connectButton}
                            color="primary"
                            variant="outlined"
                            onClick={async () => {
                                walletContextProps.connectAction.action()
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
        case 'pyro':
            if (props.tokens.length > 1)
                return <PyroTokens tokens={props.tokens} />
            return <Typography variant="subtitle1">fetching pyrotoken mapping from the blockchain...</Typography>
        default:
            return <div>Chronos</div>
    }
}
