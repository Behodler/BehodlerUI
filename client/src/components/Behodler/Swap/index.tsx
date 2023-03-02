import * as React from 'react'

import { WalletContextProvider } from '../../Contexts/WalletStatusContext'
import backImage from "../../../images/new/behodler-swap-bg.jpg"

import { StatelessBehodlerContextProvider } from './EVM_js/context/StatelessBehodlerContext'
import TradingBox3 from './TradingBox3'
import { useWatchCurrentBlockEffect } from './hooks/useCurrentBlock'

import './fonts/gilroy-font.css'

export const pyrotokensBackgroundImage = backImage

function Swap() {
    useWatchCurrentBlockEffect()

    try {
        return (
            <StatelessBehodlerContextProvider>
                <TradingBox3 />
            </StatelessBehodlerContextProvider>
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
