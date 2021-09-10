import * as React from 'react'
import Web3 from 'web3'
import { useState, useEffect, useCallback } from 'react'
import API from '../../blockchain/ethereumAPI'
import IContracts, { DefaultContracts } from '../../blockchain/IContracts'
import { UIContainerContextProps } from '@behodler/sdk/dist/types'
declare var window: any

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

function WalletContextProvider(props: { chainId: number, accountId: string, containerProps: UIContainerContextProps, children: any }) {

    const [contracts, setContracts] = useState<IContracts>(DefaultContracts)
    const [primary, setPrimary] = useState<boolean>(false)
    const [web3, setWeb3] = useState<Web3>()
    const [networkName, setNetworkName] = useState<string>("")
    const [initialized, setInitialized] = useState<boolean>(false)
    useEffect(() => {
        if (props.chainId && props.chainId > 0)
            setNetworkName(networkNameMapper(props.chainId))
    }, [props.chainId])

    const initializeWeb3Callback = useCallback(async () => {
        if (props.chainId > 0) {
            setWeb3(API.web3)
        }
    }, [props.containerProps.walletContext.active, props.chainId, props.accountId])

    useEffect(() => {
        initializeWeb3Callback()
    }, [props.containerProps.walletContext.active, props.chainId, props.accountId])

    const initializeContractsCallback = useCallback(async () => {

        if (web3 && props.chainId > 0 && props.accountId) {
            const c = await API.initialize(props.chainId, props.accountId)
            setContracts(c)
            const account = props.accountId
            const owner = (await c.behodler.Behodler.primary().call({ from: account }).toString())
            setPrimary(owner.toLowerCase() === account.toLowerCase())
            setInitialized(true)
        }
    }, [web3, props.chainId, props.accountId])

    useEffect(() => { initializeContractsCallback() }, [web3, props.containerProps.walletContext.chainId, props.containerProps.walletContext.account])

    const providerProps: walletProps = {
        contracts,
        primary,
        networkName,
        initialized
    }
    WalletContext = React.createContext<walletProps>(providerProps)
    return <WalletContext.Provider value={providerProps}> {props.children}</WalletContext.Provider>
}

export { WalletContext, WalletContextProvider }
