import * as React from 'react'
import './App.css'
import LayoutFrame from './components/LayoutFrame/index'
import {  makeStyles } from '@material-ui/core'
import { createTheme } from '@material-ui/core/styles'
import { ThemeProvider, createStyles } from '@material-ui/styles'
import GlobalStyles from './styles/GlobalStyles'
import { UIContainerContextDevProvider } from './components/Contexts/UIContainerContextDev'
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

export default function App() {
    const classes = backStyles()



    return (<ThemeProvider theme={theme}>
        <GlobalStyles />
        <div className={classes.appRoot}>
            <UIContainerContextDevProvider>
                <LayoutFrame />
            </UIContainerContextDevProvider>
        </div>
    </ThemeProvider >
    )

}
