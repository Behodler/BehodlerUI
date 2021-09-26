import * as React from 'react'
import { useContext } from 'react'
import TradingBox3 from './TradingBox3'
import { makeStyles, createStyles } from '@material-ui/core'
import { UIContainerContextProps } from '@behodler/sdk/dist/types'
import { ContainerContext } from 'src/components/Contexts/UIContainerContextDev'
import { WalletContext, WalletContextProvider } from 'src/components/Contexts/WalletStatusContext'
import { StatelessBehodlerContextProvider } from './EVM_js/context/StatelessBehodlerContext'
export type permittedRoutes = 'swap' | 'liquidity' | 'sisyphus' | 'faucet' | 'behodler/admin' | 'governance' | 'swap2' | 'pyro'

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

    })
)

export default function Swap(props: {}) {

    const uiContainerContextProps = useContext<UIContainerContextProps>(ContainerContext)
    const chainId = uiContainerContextProps.walletContext.chainId || 0;
    const account = uiContainerContextProps.walletContext.account || '0x0'
    var x = <div></div>
    try {
        x = (
            <WalletContextProvider containerProps={uiContainerContextProps} chainId={chainId} accountId={account}>
                <ConnectedDapp />
            </WalletContextProvider>
        )
    } catch (e) {
        x = <div>uncaught {e}</div>
    }
    return x
}
//TODO: replace not connected with a flag on TradingBox3

function ConnectedDapp() {
    const walletContextProps = useContext(WalletContext);
    const classes = useStyles()
    return <div className={classes.root}>
        {walletContextProps.initialized ?
            <StatelessBehodlerContextProvider>
                <TradingBox3 />
            </StatelessBehodlerContextProvider>
            : ""}
    </div>
}