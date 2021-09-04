import * as React from 'react'
import './App.css'
import LayoutFrame from './components/LayoutFrame/index'
import { createMuiTheme, makeStyles } from '@material-ui/core'
import { ThemeProvider, createStyles } from '@material-ui/styles'
import { WalletContextProvider } from './components/Contexts/WalletStatusContext'
import { BrowserRouter, withRouter } from 'react-router-dom'
import GlobalStyles from './styles/GlobalStyles'

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
    const RoutedApp = withRouter(() => {
        return (
            <WalletContextProvider>
                <ThemeProvider theme={theme}>
                    <GlobalStyles />
                    <div className={classes.appRoot}>
                        <LayoutFrame />
                    </div>
                </ThemeProvider>
            </WalletContextProvider>
        )
    })
    return (
        <BrowserRouter>
            <RoutedApp />
        </BrowserRouter>
    )
}
