import * as React from 'react'
import Web3 from 'web3'
import { useState, useEffect, useCallback } from 'react'

import API from '../../blockchain/ethereumAPI'
import IContracts, { DefaultContracts } from '../../blockchain/IContracts'
import useActiveWeb3React from "../Behodler/Swap/hooks/useActiveWeb3React";

export enum MetamaskStatus {
    disabled,
    disconnected,
    connected,
}

interface walletProps {
    contracts: IContracts
    primary: boolean,
    networkName: string,
    initialized: boolean
}


let WalletContext = React.createContext<walletProps>({
    contracts: DefaultContracts,
    primary: false,
    networkName: "",
    initialized: false
})
const networkNameMapper = (id: number): string => API.networkMapping[id]

function WalletContextProvider(props: { children: any }) {
    const [contracts, setContracts] = useState<IContracts>(DefaultContracts)
    const [primary, setPrimary] = useState<boolean>(false)
    const [web3, setWeb3] = useState<Web3>()
    const [networkName, setNetworkName] = useState<string>("")
    const [initialized, setInitialized] = useState<boolean>(false)
    const { active, chainId, account,  connector } = useActiveWeb3React()

    const initializeWeb3Callback = useCallback(async () => {
        if (chainId && connector) {
            const web3Provider = await connector.getProvider()
            API.web3 = new Web3(web3Provider)

            setWeb3(API.web3)
        }
    }, [chainId, connector])

    useEffect(() => {
        initializeWeb3Callback()
    }, [active, chainId, account])

    const initializeContractsCallback = useCallback(async () => {
        if (web3 && chainId && account) {
            const c = await API.initialize(chainId, account)
            setContracts(c)
            const owner = await c.behodler.Behodler.primary().call({ from: account })
            setPrimary(owner.toString().toLowerCase() === account.toLowerCase())
            setNetworkName(networkNameMapper(chainId))
            setInitialized(true)
        }
    }, [web3, chainId, account])

    useEffect(() => { initializeContractsCallback() }, [web3, chainId, account])

    const providerProps: walletProps = {
        contracts,
        primary,
        networkName,
        initialized,
    }

    WalletContext = React.createContext<walletProps>(providerProps)
    return <WalletContext.Provider value={providerProps}>{props.children}</WalletContext.Provider>
}

export { WalletContext, WalletContextProvider }
