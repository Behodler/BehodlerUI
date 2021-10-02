import React, { FC } from 'react'
import { UIContainerProvider } from '@behodler/sdk'
import { Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'

import { useWalletState } from './useWalletState'

export const NetworkContextName = 'NETWORK'

export const Web3ContextProvider: FC = ({ children }) => {
    const walletContext = useWeb3React<Web3Provider>()
    const networkContext = useWeb3React<Web3Provider>(NetworkContextName)

    const containerContext = {
        walletContext,
        networkContext,
        walletState: useWalletState(),
        userState: {
            userDarkMode: false
        }
    };

    return (
        <UIContainerProvider {...containerContext}>
            {children}
        </UIContainerProvider>
    )
}
