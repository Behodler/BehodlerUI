import * as React from 'react'
import { useContext } from 'react'
import { makeStyles, createStyles, Box } from '@material-ui/core'

import TradingBox3 from './TradingBox3'
import { WalletContext, WalletContextProvider } from '../../Contexts/WalletStatusContext'
import { StatelessBehodlerContextProvider } from './EVM_js/context/StatelessBehodlerContext'
import Unconnected from './TradingBox3/Unconnected'
import backImage from "../../../images/new/behodler-swap-bg.jpg"

import './fonts/gilroy-font.css'
import useActiveWeb3React from "./hooks/useActiveWeb3React";

export const pyrotokensBackgroundImage = backImage

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
        eyeLogo: {
            width: 400,
            margin: '0 -20px -60px 0'
        },
        errorMessage: {
            color: theme.palette.secondary.main,
            textAlign: 'center',
        },
        layoutFrameroot: {
            // backdropFilter: "blur(4px)",
            height: "100%",
            width: "100%",
        }, content: {
            width: "100%",
            margin: 0,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
        },
        mainContent: {
            width: "100%",
        },
    })
)

function Swap() {
    const { initialized } = useContext(WalletContext);
    const { active, chainId, account } = useActiveWeb3React()
    const classes = useStyles();

    try {
        return (
            <Box className={classes.layoutFrameroot}>
                <Box className={classes.content}>
                    <Box className={classes.mainContent} flexGrow={1}>
                        <div className={classes.root}>
                            {active && chainId && account && initialized ? (
                                <StatelessBehodlerContextProvider>
                                    <TradingBox3 />
                                </StatelessBehodlerContextProvider>
                            ) : <Unconnected />}
                        </div>
                    </Box>
                </Box>
            </Box>
        )
    } catch (e) {
        return <div>uncaught {e}</div>
    }
}

export const BehodlerUIPyrotokens = (props: any) => (
    <WalletContextProvider>
        <Swap {...props} />
    </WalletContextProvider>
)
