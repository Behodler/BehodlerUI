import * as React from 'react'
import { useState, useEffect, useCallback } from 'react'

import API from '../../blockchain/ethereumAPI'
import IContracts, { DefaultContracts } from '../../blockchain/IContracts'
import { Loading } from '../Common/Loading'
import { initWeb3Modal, createConnectWalletFn } from '../../blockchain/walletProvider'

interface walletProps {
    chainId: number
    connected: boolean
    account: string
    contracts: IContracts
    connectAction: any
    initialized: boolean
    networkName: string
    primary: boolean
    walletError: WalletError | undefined
	disconnectAction: any
}

export enum WalletError {
    NETWORK_NOT_SUPPORTED = 1
}

let WalletContext = React.createContext<walletProps>({
    chainId: 0,
    connected: false,
    account: '0x0',
    connectAction: async () => {
        console.log('connect action not set')
    },
    contracts: DefaultContracts,
    initialized: false,
    networkName: 'private',
    primary: false,
    walletError: 0,
	disconnectAction: () => {
    	console.log('disconnect action not set')
	},
})

const networkNameMapper = (id: number): string => API.networkMapping[id]

function WalletContextProvider(props: any) {
    const [connected, setConnected] = useState<boolean>(false)
    const [chainId, setChainId] = useState<number>(0)
    const [account, setAccount] = useState<string>('0x0')
    const [contracts, setContracts] = useState<IContracts>(DefaultContracts)
    const [connectAction, setConnectAction] = useState<any>()
    const [initialized, setInitialized] = useState<boolean>(false)
    const [networkName, setNetworkName] = useState<string>('')
    const [primary, setPrimary] = useState<boolean>(false)
    const [walletError, setWalletError] = useState<WalletError>()
	const [disconnectAction, setDisconnectAction] = useState<any>()
    const [connecting, setConnecting] = useState<boolean>(false)

    const initializationCallBack = useCallback(async () => {
        if (chainId > 0 && account.length > 3 && !initialized) {
            try {
				const c = await API.initialize(chainId, account)
				setContracts(c)
				const owner = (await c.behodler.Behodler.primary().call({ from: account })).toString()
				setPrimary(owner.toLowerCase() === account.toLowerCase())
				setInitialized(true)
            } catch (err) {
                setWalletError(err)
				console.error('WalletError catched', err);

				if (disconnectAction && disconnectAction.action) {
					disconnectAction.action()
				}
            }
        }
    }, [initialized, account, chainId])

	const updateChainId = useCallback((hexChainId: any, updateInitStatus) => {
		console.log('chainID response: ' + JSON.stringify(hexChainId))
		const decimalChainId = API.pureHexToNumber(hexChainId)
		console.log('chainID parsed ' + decimalChainId)
		setChainId(decimalChainId)
		setNetworkName(networkNameMapper(decimalChainId))
		if (updateInitStatus) {
			setInitialized(false)
		}
	}, [])

	const updateAccount = useCallback((accounts: any, web3Modal: any): string => {
		if (!accounts || accounts.length === 0) {
			setConnected(false)
			if (web3Modal) {
				web3Modal.clearCachedProvider();
			}
			setAccount('0x0')
			return '0x0'
		} else {
			setInitialized(true)
			setConnected(true)
			const account = accounts[0]
			setAccount(account)
			setInitialized(false)
			return account
		}
	}, [])

	useEffect(() => {
		const web3Modal = initWeb3Modal()

		const connectWallet = createConnectWalletFn(web3Modal, setConnected, setDisconnectAction, setConnecting, updateAccount, updateChainId);
		setConnectAction({ action: connectWallet })

		if (web3Modal.cachedProvider) {
			setConnecting(true);
			connectWallet();
		}
	}, [])

	useEffect(() => {
		initializationCallBack()
	}, [initialized, account, chainId])

    const providerProps: walletProps = {
        chainId,
        connected,
        account,
        contracts,
        connectAction,
        initialized,
        networkName,
        primary,
        walletError,
		disconnectAction,
	}

    WalletContext = React.createContext<walletProps>(providerProps)

    return (
    	<>
			<WalletContext.Provider value={providerProps}> {props.children}</WalletContext.Provider>
			{connecting && (
				<Loading
					headingMessage="Please wait while we connect to your wallet provider"
				/>
			)}
		</>
	)
}

export { WalletContext, WalletContextProvider }
