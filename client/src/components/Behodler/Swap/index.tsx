import * as React from 'react'
import { useState, useEffect } from 'react'
import TradingBox3 from './TradingBox3'
import { Box, makeStyles, createStyles } from '@material-ui/core'

export type permittedRoutes = 'swap' | 'liquidity' | 'sisyphus' | 'faucet' | 'behodler/admin' | 'governance' | 'swap2' | 'pyro'

interface props {
    connected: boolean
    route: permittedRoutes,
    chainId:number
    account:string
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

export default function Swap(props: props) {
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
          {props.connected?<TradingBox3 account={props.account} chainId={props.chainId} />:"Not connected"}
        </Box>
    )
}
