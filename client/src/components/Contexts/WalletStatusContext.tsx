import * as React from 'react'
import Web3 from 'web3'
import { useState, useEffect } from 'react'
import API from '../../blockchain/ethereumAPI'
import IContracts, { DefaultContracts } from '../../blockchain/IContracts'
import Web3Modal, { IProviderOptions } from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider/dist/umd/index.min'
import { WalletLink } from 'walletlink/dist/WalletLink.js'
import coinbaseWalletIcon from '../../customIcons/coinbase-wallet.svg'
import * as Portis from '@portis/web3'
import * as Fortmatic from 'fortmatic'

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

const {
	REACT_APP_INFURA_ID: INFURA_ID,
	REACT_APP_PORTIS_ID: PORTIS_ID,
	REACT_APP_RPC_CONFIGS: RPC_CONFIGS,
	REACT_APP_FORTMATIC_KEY: FORTMATIC_KEY,
	REACT_APP_FORTMATIC_CHAIN_ID: FORTMATIC_CHAIN_ID,
} = process.env;

const networkNameMapper = (id: number): string => API.networkMapping[id]

let chainIdUpdater = (
    account: string,
    setChainId: (id: number) => void,
    setNetworkName: (name: string) => void,
    setContracts: (contracts: IContracts) => void,
    setInitialized: (boolean) => void
) => {
	return (hexChainId: any) => {
		console.log('chainID response: ' + JSON.stringify(hexChainId))
		const decimalChainId = API.pureHexToNumber(hexChainId)
		console.log('chainID parsed ' + decimalChainId)
		setChainId(decimalChainId)
		setNetworkName(networkNameMapper(decimalChainId))
		setInitialized(false)
	}
}

let accountUpdater = (setAccount: (account: string) => void, setConnected: (c: boolean) => void, setInitialized: (boolean) => void, web3Modal) => {
	return (accounts: any): string => {
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
	}
}

const convertRPCConfigsStringToObject = rpcConfigs => (
	Object
		.fromEntries((
			rpcConfigs
				.split(',')
				.map(chainIdToUrlString => chainIdToUrlString.split('|'))
		))
);

const initWeb3Modal = () => {
	let providerOptions: IProviderOptions = {}

	const rpcConfig = RPC_CONFIGS
		? convertRPCConfigsStringToObject(RPC_CONFIGS)
		: undefined

	const mainnetRpc = rpcConfig && rpcConfig[1];
	const fortmaticCustomNodeOptions = (
		FORTMATIC_KEY && FORTMATIC_CHAIN_ID && rpcConfig && rpcConfig[FORTMATIC_CHAIN_ID]
			? {
				rpcUrl: rpcConfig[FORTMATIC_CHAIN_ID],
				chainId: parseInt(FORTMATIC_CHAIN_ID, 10),
			}
			: undefined
	);

	// e.g REACT_APP_RPC_CONFIGS=1|https://mainnet.infura.io/v3/INFURA_ID,2|https://morder-rpc-url
	if (INFURA_ID || rpcConfig) {
		providerOptions.walletconnect = {
			package: WalletConnectProvider,
			options: {
				infuraId: rpcConfig
					? undefined
					: INFURA_ID,
				rpc: rpcConfig,
			}
		}

		if (!mainnetRpc && !INFURA_ID) {
			console.info('There is no RPC URL defined for chainId 1 in REACT_APP_RPC_CONFIGS node env variable - it is required in order for WalletLink to work');
		}

		if (mainnetRpc || INFURA_ID) {
			const walletlinkRPCURL = rpcConfig
				? mainnetRpc // hardcoded mainnet
				: `https://mainnet.infura.io/v3/${INFURA_ID}`

			providerOptions['custom-walletlink'] = {
				display: {
					logo: coinbaseWalletIcon,
					name: 'Coinbase Wallet',
					description: 'Scan with WalletLink to connect',
				},
				package: WalletLink,
				connector: async () => {
					const walletLink = new WalletLink({ appName: 'Behodler' })
					const walletLinkProvider = walletLink
						.makeWeb3Provider(walletlinkRPCURL)
					await walletLinkProvider.enable()

					return walletLinkProvider
				},
			}
		}
	}

	if (PORTIS_ID) {
		providerOptions.portis = {
			package: Portis,
			options: {
				id: PORTIS_ID,
			}
		}
	}

	if (FORTMATIC_KEY) {
		providerOptions.fortmatic = {
			package: Fortmatic,
			options: {
				key: FORTMATIC_KEY,
				network: fortmaticCustomNodeOptions,
			},
		}
	}

	return new Web3Modal({
		cacheProvider: true,
		providerOptions,
	});
};

const getDisconnectProviderFn = (provider, handleWalletDisconnected): any => {
	const triggerCommonDisconnectFn = async (message) => {
		if (typeof provider.disconnect === 'function') await provider.disconnect()
		if (typeof provider.close === 'function') await provider.close()

		handleWalletDisconnected(`: ${message}`)
	}

	if (provider.isMetaMask) {
		return async () => {
			provider.emit('disconnect')
			await triggerCommonDisconnectFn('Metamask disconnected by user')
		}
	} else if (provider.isPortis) {
		return async () => {
			provider._portis.logout()
			await triggerCommonDisconnectFn('Portis disconnected by user')
			window.location.reload() // after logging out, Portis still pulls from Infura API, I couldn't find other way to get it to stop
		}
	} else if (provider.wc) {
		return async () => {
			await triggerCommonDisconnectFn('Walletconnect provider disconnected by user')
			window.location.reload() // fix for walletconnect QR code popup showing up after a disconnection
		}
	} else if (provider.isWalletLink) {
		return async () => {
			await triggerCommonDisconnectFn('Walletlink provider disconnected by user')
		}
	} else if (provider.isFortmatic) {
		return async () => {
			if (provider.fm.user && typeof provider.fm.user.logout === 'function') await provider.fm.user.logout()
			await triggerCommonDisconnectFn('Fortmatic disconnected by user')
			window.location.reload()
		}
	}

	return
}

const createConnectWalletFn = (web3Modal, setConnected, setAccount, setInitialized, setChainId, setNetworkName, setContracts, setDisconnectAction) => async () => {
	if (!INFURA_ID && !RPC_CONFIGS) {
		console.info('Neither REACT_APP_INFURA_ID nor REACT_APP_RPC_CONFIGS environment variable is set. One of these are required in order for WalletConnect and WalletLink providers to work.')
	}

	if (!PORTIS_ID) {
		console.info('REACT_APP_PORTIS_ID environment variable is not set. It is required in order for Portis wallet provider to work.')
	}

	if (!FORTMATIC_KEY) {
		console.info('REACT_APP_FORTMATIC_KEY environment variable is not set. It is required in order for Fortmatic wallet provider to work.')
	}

	const handleWalletDisconnected = (info: any = null) => {
		console.log('wallet provider disconnected', info)

		setConnected(false)
		web3Modal.clearCachedProvider()
	}

	let provider

	try {
		provider = await web3Modal.connect()
		API.web3 = new Web3(provider)
		console.info('connected to a wallet provider', {
			web3Modal,
			provider,
		});
	} catch (error) {
		handleWalletDisconnected(error)
	}

	if (!provider) { return }

	const disconnectFn = getDisconnectProviderFn(provider, handleWalletDisconnected);

	if (typeof disconnectFn === 'function') {
		setDisconnectAction({ action: disconnectFn })
	}

	try {
		let accountUpdateHandlerOnce = accountUpdater(setAccount, setConnected, () => {}, null)
		let accountUpdateHandler = accountUpdater(setAccount, setConnected, setInitialized, web3Modal)

		const accounts = await API.web3.eth.getAccounts()
		accountUpdateHandlerOnce(accounts)

		let chainIdUpdateHandlerOnce = chainIdUpdater(accounts[0], setChainId, setNetworkName, setContracts, () => {})
		let chainIdUpdateHandler = chainIdUpdater(accounts[0], setChainId, setNetworkName, setContracts, setInitialized)

		const providerChainId = provider.isPortis
			? provider._portis.config.network.chainId
			: provider.chainId || provider._chainId || FORTMATIC_CHAIN_ID || 1

		console.info('providerChainId', providerChainId);

		chainIdUpdateHandlerOnce(providerChainId)

		const handleWalletConnected = (info: { chainId: number }) => {
			console.log('wallet provider connected', info)
		}

		if (provider && typeof provider.on === 'function') {
			provider.on("accountsChanged", accountUpdateHandler)
			provider.on("chainChanged", chainIdUpdateHandler)
			provider.on("connect", handleWalletConnected)
			provider.on("disconnect", handleWalletDisconnected)
		}
	} catch (error) {
		handleWalletDisconnected()

		if (error.code === 4001) {
			console.info('User rejected connection request. see EIP 1193 for more details.')
		} else {
			console.error('Unhandled wallet connection error: ' + error)
		}
	}
}

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
		const web3Modal = initWeb3Modal()

		const connectWallet = createConnectWalletFn(web3Modal, setConnected, setAccount, setInitialized, setChainId, setNetworkName, setContracts, setDisconnectAction);
		setConnectAction({ action: connectWallet })

		if (web3Modal.cachedProvider) {
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
    return <WalletContext.Provider value={providerProps}> {props.children}</WalletContext.Provider>
}

export { WalletContext, WalletContextProvider }
