import * as React from 'react'
import Web3 from 'web3'
import { useState, useEffect } from 'react'

import API from '../../blockchain/ethereumAPI'
import IContracts, { DefaultContracts } from '../../blockchain/IContracts'
import useActiveWeb3React from "../Behodler/Swap/hooks/useActiveWeb3React";

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
    const [networkName, setNetworkName] = useState<string>("")
    const [initialized, setInitialized] = useState<boolean>(false)
    const { chainId, account,  connector } = useActiveWeb3React()

    useEffect(() => {
        (async () => {
            if (chainId && connector) {
                const web3Provider = await connector.getProvider()
                API.web3 = new Web3(web3Provider)

                if (account) {
                    const c = await API.initialize(chainId, account)
                    setContracts(c)
                    const owner = await c.behodler.Behodler.primary().call({ from: account })
                    setPrimary(owner.toString().toLowerCase() === account.toLowerCase())
                    setNetworkName(networkNameMapper(chainId))
                    setInitialized(true)
                }
            }
        })();
    }, [chainId, account])

    const providerProps: walletProps = {
        contracts,
        primary,
        networkName,
        initialized,
    }

    if (!initialized) {
        return (
            <div
                style={{
                    alignItems: 'center',
                    color: '#9081d2',
                    display: 'flex',
                    height: '100vh',
                    justifyContent: 'center',
                }}
            >
                Initializing the app, please wait.
            </div>
        )
    }

    WalletContext = React.createContext<walletProps>(providerProps)
    return <WalletContext.Provider value={providerProps}>{props.children}</WalletContext.Provider>
}

export { WalletContext, WalletContextProvider }
