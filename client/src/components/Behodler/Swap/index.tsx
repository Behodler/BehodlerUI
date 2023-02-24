import * as React from 'react'

import TradingBox3 from './TradingBox3'
import { PyroV3Swap } from './PyroV3Swap'
import { WalletContextProvider } from '../../Contexts/WalletStatusContext'
import { StatelessBehodlerContextProvider } from './EVM_js/context/StatelessBehodlerContext'
import backImage from "../../../images/new/behodler-swap-bg.jpg"

import './fonts/gilroy-font.css'
import useActiveWeb3React from "./hooks/useActiveWeb3React";

export const pyrotokensBackgroundImage = backImage

function Swap() {
    const { chainId } = useActiveWeb3React()
    const isDevEnv = chainId === 1337;

    try {
        return (
            <StatelessBehodlerContextProvider>
                {!isDevEnv ? <PyroV3Swap /> : <TradingBox3 />}
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
