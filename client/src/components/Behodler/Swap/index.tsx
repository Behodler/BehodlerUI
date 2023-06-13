import * as React from 'react'

import { WalletContextProvider } from '../../Contexts/WalletStatusContext'
import backImage from "../../../images/new/behodler-swap-bg.jpg"
import { Box, CircularProgress, Typography } from '@material-ui/core';
import { StatelessBehodlerContextProvider } from './EVM_js/context/StatelessBehodlerContext'
import TradingBox3 from './TradingBox3'
import { useWatchCurrentBlockEffect } from './hooks/useCurrentBlock'

import './fonts/gilroy-font.css'
import { rowsAtom, useTokenRows } from './hooks/useTokeRows'
import { useEffect, useState } from 'react'
import { useAtom } from 'jotai';

export const pyrotokensBackgroundImage = backImage

function Swap() {
    useWatchCurrentBlockEffect()
    useTokenRows() //kick off row population
    const [loaded, setLoaded] = useState(false)
    const [rows,] = useAtom(rowsAtom)
    useEffect(() => {
        const newLoaded = !!rows && rows.length > 0
        if (newLoaded !== loaded)
            setTimeout(() => setLoaded(newLoaded), 0)
    }, [rows])
    
    try {


        return (loaded ? <StatelessBehodlerContextProvider >
            <TradingBox3 />
        </StatelessBehodlerContextProvider>
            :
            <Box display="flex" height="100vh" alignItems="center" justifyContent="center" flexDirection="column" style={{ paddingBottom: '10%' }}>
                <Typography variant="h4" component="h4" gutterBottom style={{ color: "#9081d2" }}>
                    Loading PyroTokens...
                </Typography>
                <CircularProgress size={60} style={{ color: '#9081d2' }} />
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
