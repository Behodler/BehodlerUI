import * as React from 'react'
import {  makeStyles } from '@material-ui/core'
import { createTheme } from '@material-ui/core/styles'
import { ThemeProvider, createStyles } from '@material-ui/styles'
import { createWeb3ReactRoot, Web3ReactProvider } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'

import './App.css'
import LayoutFrame from './components/LayoutFrame/index'
import GlobalStyles from './styles/GlobalStyles'
import { Web3ContextProvider, NetworkContextName } from './components/Contexts/Web3ContextProvider'
import { Web3ReactManager } from './components/Web3ReactManager'
import { UIContainerContextDevProvider } from './components/Contexts/UIContainerContextDev'
import { WalletContextProvider } from './components/Contexts/WalletStatusContext'

const theme = createTheme({
    palette: {
        type: 'light',
    },
    typography: {
        fontFamily: 'Gilroy',
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

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName)

function getLibrary(provider: any): Web3Provider {
    const library = new Web3Provider(provider, 'any')
    library.pollingInterval = 15000
    return library
}

export default function App() {
    const classes = backStyles()



    return (
        <ThemeProvider theme={theme}>
            <GlobalStyles />
            <div className={classes.appRoot}>
                <Web3ReactProvider getLibrary={getLibrary}>
                    <Web3ProviderNetwork getLibrary={getLibrary}>
                        <Web3ContextProvider>
                            <Web3ReactManager>
                                <UIContainerContextDevProvider>
                                    <WalletContextProvider>
                                        <LayoutFrame />
                                    </WalletContextProvider>
                                </UIContainerContextDevProvider>
                            </Web3ReactManager>
                        </Web3ContextProvider>
                    </Web3ProviderNetwork>
                </Web3ReactProvider>
            </div>
        </ThemeProvider >
    )

}
