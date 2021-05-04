import {Box, makeStyles, createStyles, Typography, Button, Container} from "@material-ui/core";
import React, {FC, useContext} from "react"
import {WalletContext, WalletError} from "src/components/Contexts/WalletStatusContext";
import eyelogo from '../../images/behodler/landingPage/EyeLogo.png'
import alternateLogo from '../../images/behodler/tradhodler.png'
import {BlockchainError} from "../../blockchain/ethereumAPI";

interface LandingContentProps {
    setShowMetamaskInstallPopup: (boolean) => void
}

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: 32
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
        connectButton: {
        },
        warningText: {
            color: 'black',
            fontStyle: 'italic',
            maxWidth: 800,
            textAlign: 'center',
            paddingLeft: 8,
            paddingRight: 8
        },
        behodlerLogo: {
            paddingTop: 4,
            paddingBottom: 4,
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

const getMessageError = (walletError: WalletError | BlockchainError): any => {
    switch (walletError) {
        case WalletError.NETWORK_NOT_SUPPORTED:
            return <>Your wallet's network is currently not supported<br/>Please make sure it is Ethereum Mainnet!</>
        case BlockchainError.ERROR_ACCESSING_CONTRACTS:
            return <>Unable to reach smart contracts<br/>Please try again later or contact support</>
        default:
            return ''
    }
}

const LandingContent: FC<LandingContentProps> = (props) => {
    const classes = useStyles()
    const walletContextProps = useContext(WalletContext)

    return (
        <Box className={classes.root}>
            <Box>
                <img src={eyelogo}/>
            </Box>
            <Box mt={3}>
                <Button
                    className={classes.connectButton}
                    color="primary"
                    variant="outlined"
                    onClick={async () => {
                        walletContextProps.isMetamask ?
                            walletContextProps.connectAction.action() :
                            props.setShowMetamaskInstallPopup(true)
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
                    Behodler is a suite of liquidity management tools for the discerning DeFi connoisseur. Swap tokens
                    cheaply with logarithmic bonding curves.
                    Gain exposure to the entire pool of liquidity by minting Scarcity. Tap into the liquidity growth of
                    a single token by minting a Pyrotoken
                    wrapper. Exploit price arbitrage with a zero fee, low gas flashloan or let your tokens work for you
                    passively by queuing for liquidity in the
                    Liquid Queue (coming soon). While you wait in the queue, we pay you Eye on an hourly basis. The more
                    spots in the queue you occupy, the more
                    Eye you earn per hour.
                </Typography>
            </Box>
            <Box>
                <Container className={classes.logoContainer}>
                    <img src={alternateLogo} className={classes.behodlerLogo}/>
                </Container>
            </Box>
        </Box>
    );
}

export default LandingContent;