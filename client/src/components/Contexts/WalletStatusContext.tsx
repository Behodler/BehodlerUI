import * as React from 'react'
import Web3 from 'web3'
import { useState, useEffect } from 'react'

import API from '../../blockchain/ethereumAPI'
import IContracts, { DefaultContracts } from '../../blockchain/IContracts'
import useActiveWeb3React from "../Behodler/Swap/hooks/useActiveWeb3React";
import { useContractCall } from "../Behodler/Swap/hooks/useContracts";

interface WalletContextProps {
    contracts: IContracts
    primary: boolean,
    networkName: string,
    initialized: boolean
}

let WalletContext = React.createContext<WalletContextProps>({
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
    const { chainId, account, connector } = useActiveWeb3React()

    const [callContract] = useContractCall()

    useEffect(() => {
        (async () => {
            if (chainId && connector) {
                const web3Provider = await connector.getProvider()
                API.web3 = new Web3(web3Provider)

                if (account && !initialized) {
                    const c = await API.initialize(chainId, account)
                    setContracts(c)
                    const owner = await callContract({
                        contract:  c.behodler.Behodler2.Behodler2,
                        method: 'owner',
                        overrides: { from: account },
                    }) || ''
                    setPrimary(owner.toString().toLowerCase() === account.toLowerCase())
                    setNetworkName(networkNameMapper(chainId))
                    setInitialized(true)
                }

                if (!account && initialized) {
                    setInitialized(false)
                }
            }
        })();
    }, [chainId, account, connector, initialized])

    const providerProps: WalletContextProps = {
        contracts,
        primary,
        networkName,
        initialized,
    }

    if (!initialized || !account) {
        return (
            <div
                style={{
                    alignItems: 'center',
                    color: '#9081d2',
                    display: 'flex',
                    height: '100%',
                    justifyContent: 'center',
                }}
            >
                Please connect your Web3 wallet to continue.
            </div>
        )
    }

    WalletContext = React.createContext<WalletContextProps>(providerProps)
    return <WalletContext.Provider value={providerProps}>{props.children}</WalletContext.Provider>
}

export {WalletContext, WalletContextProvider}
export type { WalletContextProps }
