import * as React from 'react'
import Web3 from 'web3'
import { useState, useEffect } from 'react'
import API from '../../blockchain/ethereumAPI'
import IContracts, { DefaultContracts } from '../../blockchain/IContracts'
declare var window: any

export enum MetamaskStatus {
    disabled,
    disconnected,
    connected,
}

interface walletProps {
    chainId: number
    isMetamask: boolean
    connected: boolean
    account: string
    contracts: IContracts
    connectAction: any
    initialized: boolean
    networkName: string
    primary: boolean
    walletError: WalletError | undefined
}

export enum WalletError {
    NETWORK_NOT_SUPPORTED = 1
}

let WalletContext = React.createContext<walletProps>({
    chainId: 0,
    isMetamask: false,
    connected: false,
    account: '0x0',
    connectAction: async () => {
        console.log('connect action not set')
    },
    contracts: DefaultContracts,
    initialized: false,
    networkName: 'private',
    primary: false,
    walletError: 0
})

const networkNameMapper = (id: number): string => API.networkMapping[id]

let chainIdUpdater = (
    account: string,
    setChainId: (id: number) => void,
    setNetworkName: (name: string) => void,
    setContracts: (contracts: IContracts) => void,
    setInitialized: (boolean) => void
) => {
    return (response: any) => {
        const chainIDNum = API.pureHexToNumber(response)
        setChainId(chainIDNum)
        setNetworkName(networkNameMapper(chainIDNum))
        setInitialized(false)
    }
}

let accountUpdater = (setAccount: (account: string) => void, setConnected: (c: boolean) => void, setInitialized: (boolean) => void) => {
    return (response: any): string => {
        if (!response || response.length === 0) {
            setConnected(false)
            setAccount('0x0')
            return '0x0'
        } else {
            setInitialized(true)
            setConnected(true)
            const account = response[0]
            setAccount(account)
            setInitialized(false)
            return account
        }
    }
}

function WalletContextProvider(props: any) {
    const [isMetamask, setIsMetamask] = useState<boolean>(false)
    const [connected, setConnected] = useState<boolean>(false)
    const [chainId, setChainId] = useState<number>(0)
    const [account, setAccount] = useState<string>('0x0')
    const [contracts, setContracts] = useState<IContracts>(DefaultContracts)
    const [loaded, setLoaded] = useState<boolean>(false)
    const [connectAction, setConnectAction] = useState<any>()
    const [initialized, setInitialized] = useState<boolean>(false)
    const [networkName, setNetworkName] = useState<string>('')
    const [primary, setPrimary] = useState<boolean>(false)
    const [walletError, setWalletError] = useState<WalletError>()

    const initializationCallBack = React.useCallback(async () => {
        if (chainId > 0 && account.length > 3 && !initialized) {
            try {
                const c = await API.initialize(chainId, account)
                setContracts(c)
                const owner = (await c.behodler.Behodler.primary().call({ from: account })).toString()
                setPrimary(owner.toLowerCase() === account.toLowerCase())
                setInitialized(true)
            } catch (err) {
                setWalletError(err)
            }
        }
    }, [initialized, account, chainId])

    useEffect(() => {
        initializationCallBack()
    }, [initialized, account, chainId])

    useEffect(function () {
        if (!window.ethereum || !window.ethereum.isMetaMask) {
            setIsMetamask(false)
            setConnected(false)
        } else if (window.ethereum.isMetaMask && !loaded) {
            setLoaded(true)
            setIsMetamask(true)
            API.web3 = new Web3(window.ethereum)

            let accountUpdateHandlerOnce = accountUpdater(setAccount, setConnected, () => {})
            let accountUpdateHandler = accountUpdater(setAccount, setConnected, setInitialized)
            window.ethereum
                .request({ method: 'eth_accounts' })
                .then(accountUpdateHandlerOnce)
                .then((acc) => {
                    let chainIdUpdateHandlerOnce = chainIdUpdater(acc, setChainId, setNetworkName, setContracts, () => {})
                    let chainIdUpdateHandler = chainIdUpdater(acc, setChainId, setNetworkName, setContracts, setInitialized)
                    window.ethereum
                        .request({ method: 'eth_chainId' })
                        .then(chainIdUpdateHandlerOnce)
                        .then(() => {
                            window.ethereum.on('accountsChanged', accountUpdateHandler)
                            window.ethereum.on('chainChanged', chainIdUpdateHandler)
                        })
                        .catch((err) => console.log('chainId error ' + err))
                })
                .catch((err) => {
                    if (err.code === 4100) {
                        // EIP 1193 unauthorized error
                        console.log('Please connect to MetaMask.')
                    } else {
                        console.error(err)
                    }
                })
            let connectionActionObject = {
                action: () => {
                    window.ethereum
                        .request({ method: 'eth_requestAccounts' })
                        .then(() => window.location.reload())
                        .catch((err: any) => {
                            setConnected(false)
                            if (err.code === 4001) {
                                console.log('User rejected connection request. see EIP 1193 for more details.')
                            } else {
                                console.error('Unhandled wallet connection error: ' + err)
                            }
                        })
                },
            }
            setConnectAction(connectionActionObject)
        }
    })

    const providerProps: walletProps = {
        chainId,
        isMetamask,
        connected,
        account,
        contracts,
        connectAction,
        initialized,
        networkName,
        primary,
        walletError
    }
    WalletContext = React.createContext<walletProps>(providerProps)
    return <WalletContext.Provider value={providerProps}> {props.children}</WalletContext.Provider>
}

export { WalletContext, WalletContextProvider }
