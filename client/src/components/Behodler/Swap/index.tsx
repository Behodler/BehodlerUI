import * as React from 'react'

import TradingBox3 from './TradingBox3'
import { WalletContextProvider } from '../../Contexts/WalletStatusContext'
import { StatelessBehodlerContextProvider } from './EVM_js/context/StatelessBehodlerContext'
import backImage from "../../../images/new/behodler-swap-bg.jpg"

import './fonts/gilroy-font.css'

export const pyrotokensBackgroundImage = backImage

function Swap() {
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
