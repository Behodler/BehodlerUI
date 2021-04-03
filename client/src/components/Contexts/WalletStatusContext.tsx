import * as React from "react"
import Web3 from "web3"
import Web3Modal from "web3modal"
import WalletConnectProvider from "@walletconnect/web3-provider/dist/umd/index.min"
import { WalletLink } from "walletlink/dist/WalletLink.js"
import { useState, useEffect } from "react"
import API from '../../blockchain/ethereumAPI'
import IContracts, { DefaultContracts } from '../../blockchain/IContracts'
import coinbaseWalletIcon from '../../customIcons/coinbase-wallet.svg'
import * as Portis from "@portis/web3"

interface walletProps {
	chainId: number
	connected: boolean
	account: string
	contracts: IContracts
	connectAction: any
	initialized: boolean
	networkName: string,
	primary: boolean
	isMelkor: boolean
}

let WalletContext = React.createContext<walletProps>({
	chainId: 0,
	connected: false,
	account: "0x0",
	connectAction: async () => { console.log('connect action not set') },
	contracts: DefaultContracts,
	initialized: false,
	networkName: 'private',
	primary: false,
	isMelkor: false
})

const networkNameMapper = (id: number): string => {
	switch (id) {
		case 1: return "main"
		case 2: return "morden"
		case 3: return "ropsten"
		case 4: return "rinkeby"
		case 5: return "goerli"
		case 42: return "kovan"
		case 66: return "private"
		default: return "private"
	}
}

let chainIdUpdater = (account: string, setChainId: (id: number) => void, setNetworkName: (name: string) => void, setContracts: (contracts: IContracts) => void, setInitialized: (boolean) => void) => {
	return (hexChainId: any) => {
		const decimalChainId = API.pureHexToNumber(hexChainId)
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

function WalletContextProvider(props: any) {
	const [connected, setConnected] = useState<boolean>(false)
	const [chainId, setChainId] = useState<number>(0)
	const [account, setAccount] = useState<string>('0x0')
	const [contracts, setContracts] = useState<IContracts>(DefaultContracts)
	const [connectAction, setConnectAction] = useState<any>()
	const [initialized, setInitialized] = useState<boolean>(false)
	const [networkName, setNetworkName] = useState<string>("")
	const [primary, setPrimary] = useState<boolean>(false)
	const [isMelkor, setMelkor] = useState<boolean>(false)

	const initializationCallBack = React.useCallback(async () => {
		if (chainId > 0 && account.length > 3 && !initialized) {
			const c = await API.initialize(chainId, account)
			setContracts(c)
			const owner = (await c.behodler.Behodler.primary().call({ from: account })).toString()
			const melkor = await c.behodler.Behodler2.Morgoth.PowersRegistry.isUserMinion(account, API.web3.utils.fromAscii('Melkor')).call({ from: account })

			setMelkor(melkor)
			setPrimary(owner.toLowerCase() === account.toLowerCase())
			setInitialized(true)
		}
	}, [initialized, account, chainId])

	const createConnectWallet = (web3Modal) => async () => {
		if (!process.env.REACT_APP_INFURA_ID) {
			console.info('REACT_APP_INFURA_ID environment variable is not set. It is required in order for WalletConnect and WalletLink providers to work.')
		}

		if (!process.env.REACT_APP_PORTIS_ID) {
			console.info('REACT_APP_PORTIS_ID environment variable is not set. It is required in order for Portis wallet provider to work.')
		}

		let provider

		try {
			provider = await web3Modal.connect()
			API.web3 = new Web3(provider)
		} catch (error) {
			setConnected(false)
			web3Modal.clearCachedProvider();
			console.info('Unable to establish wallet connection', error)
		}

		if (!provider) { return }

		try {
			let accountUpdateHandlerOnce = accountUpdater(setAccount, setConnected, () => {}, null)
			let accountUpdateHandler = accountUpdater(setAccount, setConnected, setInitialized, web3Modal)

			const accounts = await API.web3.eth.getAccounts()
			accountUpdateHandlerOnce(accounts)

			let chainIdUpdateHandlerOnce = chainIdUpdater(accounts[0], setChainId, setNetworkName, setContracts, () => {})
			let chainIdUpdateHandler = chainIdUpdater(accounts[0], setChainId, setNetworkName, setContracts, setInitialized)

			const providerChainId = provider.isPortis
				? provider._portis.config.network.chainId
				: provider.chainId || provider._chainId

			chainIdUpdateHandlerOnce(providerChainId)

			const walletConnectionHandler = (info: { chainId: number }) => {
				console.log('wallet provider connected', info)
			}

			const walletDisconnectionHandler = async (error: { code: number; message: string }) => {
				console.log('wallet provider disconnected', error)

				setConnected(false)
				web3Modal.clearCachedProvider();
			}

			if (provider && typeof provider.on === 'function') {
				provider.on("accountsChanged", accountUpdateHandler)
				provider.on("chainChanged", chainIdUpdateHandler)
				provider.on("connect", walletConnectionHandler)
				provider.on("disconnect", walletDisconnectionHandler)
			}
		} catch (error) {
			setConnected(false)
			web3Modal.clearCachedProvider();

			if (error.code === 4001) {
				console.info('User rejected connection request. see EIP 1193 for more details.')
			} else {
				console.error('Unhandled wallet connection error: ' + error)
			}
		}
	}

	useEffect(() => {
		const web3Modal = new Web3Modal({
			cacheProvider: true,
			providerOptions: {
				walletconnect: {
					package: WalletConnectProvider,
					options: {
						infuraId: process.env.REACT_APP_INFURA_ID,
					}
				},
				'custom-walletlink': {
					display: {
						logo: coinbaseWalletIcon,
						name: 'Coinbase Wallet',
						description: 'Scan with WalletLink to connect',
					},
					options: {
						appName: 'Behodler',
						infuraId: process.env.REACT_APP_INFURA_ID,
						darkMode: false,
					},
					package: WalletLink,
					connector: async (_, options) => {
						const { appName, infuraId } = options
						const walletLink = new WalletLink({
							appName
						});
						const walletLinkProvider = walletLink
							.makeWeb3Provider(`https://mainnet.infura.io/v3/${infuraId}`)
						await walletLinkProvider.enable()

						return walletLinkProvider
					},
				},
				portis: {
					package: Portis,
					options: {
						id: process.env.REACT_APP_PORTIS_ID,
					}
				},
			},
		})

		const connectWallet = createConnectWallet(web3Modal);
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
		isMelkor
	}
	WalletContext = React.createContext<walletProps>(providerProps)
	return <WalletContext.Provider value={providerProps}> {props.children}</WalletContext.Provider>

}


export { WalletContext, WalletContextProvider }
