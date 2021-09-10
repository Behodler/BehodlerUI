import * as React from 'react'
import './App.css'
import LayoutFrame from './components/LayoutFrame/index'
import { createMuiTheme, makeStyles } from '@material-ui/core'
import { ThemeProvider, createStyles } from '@material-ui/styles'
import { WalletContextProvider } from './components/Contexts/WalletStatusContext'
import { UIContainerContextProps } from '@behodler/sdk/dist/types'
import GlobalStyles from './styles/GlobalStyles'
import { UIContainerContextDevProvider, ContainerContext } from './components/Contexts/UIContainerContextDev'
import { useContext, useState } from 'react'
const theme = createMuiTheme({
    palette: {
        type: 'light',
    },
    typography: {
        fontFamily: 'Gilroy-medium',
        //fontSize:11
    },
})

const backStyles = makeStyles((theme) =>
    createStyles({
        appRoot: {
            height: '100%',

            bottom: 0,
            width: '100%',
        },
    })
)

export default function App() {
    const classes = backStyles()
    const [chainId, setChainId] = useState<number>(0)
    const [account, setAccount] = useState<string>('')


    return (<ThemeProvider theme={theme}>
        <GlobalStyles />
        <div className={classes.appRoot}>
            <UIContainerContextDevProvider chainId={chainId} account={account} setChainId={setChainId} setAccount={setAccount}>
                <ConnectedDapp chainId={chainId} account={account} />
            </UIContainerContextDevProvider>

        </div>
    </ThemeProvider >
    )
}

function ConnectedDapp(props: { chainId: number, account: string }) {
    const uiContainerContextProps = useContext<UIContainerContextProps>(ContainerContext)
    return (
        <WalletContextProvider containerProps={uiContainerContextProps} chainId={props.chainId} accountId={props.account}>
            <LayoutFrame chainId={props.chainId} account={props.account} />
        </WalletContextProvider>
    )
}

