import * as React from "react"
import Web3 from "web3";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider/dist/umd/index.min";
import { useState, useEffect } from "react"
import API from '../../blockchain/ethereumAPI'
import IContracts, { DefaultContracts } from '../../blockchain/IContracts'
declare var window: any

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
});

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
	const [connected, setConnected] = useState<boolean>(false)
	const [chainId, setChainId] = useState<number>(0)
	const [account, setAccount] = useState<string>('0x0')
	const [contracts, setContracts] = useState<IContracts>(DefaultContracts)
	const [loaded, setLoaded] = useState<boolean>(false)
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


	useEffect(() => {
		initializationCallBack()
	}, [initialized, account, chainId])

	useEffect(() => {
		if (!window.ethereum) {
			setConnected(false)
		} else if (!loaded) {
			setLoaded(true)
		}
	})

	const connectWallet = async () => {
		if (!process.env.REACT_APP_INFURA_ID) {
			console.info('REACT_APP_INFURA_ID environment variable is not set. It is required in order for WalletConnectProvider to work.');
		}

		const web3Modal = new Web3Modal({
			network: networkName,
			cacheProvider: false,
			providerOptions: {
				walletconnect: {
					package: WalletConnectProvider,
					options: {
						infuraId: process.env.REACT_APP_INFURA_ID,
					}
				},
			},
		});
		const provider = await web3Modal.connect();

		API.web3 = new Web3(provider);

		const handleWalletError = (error) => {
			if (error.code === 4001) {
				console.log('User rejected connection request. see EIP 1193 for more details.')
			} else {
				console.error('Unhandled wallet connection error: ' + error)
			}
		}

		try {
			let accountUpdateHandlerOnce = accountUpdater(setAccount, setConnected, () => {
			})
			let accountUpdateHandler = accountUpdater(setAccount, setConnected, setInitialized)

			const accounts = await API.web3.eth.getAccounts();
			accountUpdateHandlerOnce(accounts)

			let chainIdUpdateHandlerOnce = chainIdUpdater(accounts[0], setChainId, setNetworkName, setContracts, () => {
			})
			let chainIdUpdateHandler = chainIdUpdater(accounts[0], setChainId, setNetworkName, setContracts, setInitialized)
			const chainId = await window.ethereum.request({method: 'eth_chainId'})
			chainIdUpdateHandlerOnce(chainId)

			if (provider && typeof provider.on === 'function') {
				provider.on("accountsChanged", accountUpdateHandler);
				provider.on("chainChanged", chainIdUpdateHandler);

				provider.on("connect", (info: { chainId: number }) => {
					console.log('wallet provider connected', info);
				});

				provider.on("disconnect", async (error: { code: number; message: string }) => {
					console.log('wallet provider disconnected', error);

					setConnected(false)
				});
			}

		} catch (error) {
			handleWalletError(error);
		}
	}

	useEffect(() => {
		setConnectAction({ action: connectWallet })
	}, [loaded])

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
	WalletContext = React.createContext<walletProps>(providerProps);
	return <WalletContext.Provider value={providerProps}> {props.children}</WalletContext.Provider>

}


export { WalletContext, WalletContextProvider };
