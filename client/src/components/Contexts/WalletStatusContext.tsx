import * as React from "react"
import Web3 from "web3";
import { useState, useEffect } from "react"
import API from '../../blockchain/ethereumAPI'
import IContracts, { DefaultContracts } from '../../blockchain/IContracts'
declare var window: any

export enum MetamaskStatus {
	disabled,
	disconnected,
	connected
}

interface rpcResult {
	id: number,
	jsonrpc: string,
	result: any
}

interface walletProps {
	chainId: number
	isMetamask: boolean
	connected: boolean
	account: string
	contracts: IContracts,
	connectAction: any
	versionBalances: any
	oldBalances: any
	primary: boolean
	enabled: boolean,
	initialized: boolean
}

let WalletContext = React.createContext<walletProps>({
	chainId: 0,
	isMetamask: false,
	connected: false,
	account: "0x0",
	connectAction: async () => { console.log('hello') },
	versionBalances: [],
	oldBalances: [],
	primary: false,
	enabled: false,
	contracts: DefaultContracts,
	initialized: false
});

let chainIdUpdater = (account: string, setChainId: (id: number) => void, setContracts: (contracts: IContracts) => void, setVersionBalances: (contracts: IContracts, account: string) => Promise<void>, setInitialized: (boolean) => void) => {
	return (response: rpcResult) => {
		const chainIDNum = API.pureHexToNumber(response.result)
		setChainId(chainIDNum)
		setInitialized(false)
	}
}

let accountUpdater = (setAccount: (account: string) => void, setConnected: (c: boolean) => void, setInitialized: (boolean) => void) => {
	return (response: rpcResult): string => {
		if (!response.result || response.result.length === 0) {
			setConnected(false)
			setAccount('0x0')
			return '0x0'
		} else {
			setInitialized(true)
			setConnected(true)
			const account = response.result[0]
			setAccount(account)
			setInitialized(false)
			return account
		}
	}
}

let chainVersionUpdater = (setVersionBalances: ([]) => void, setOldBalances: (boolean) => void, setPrimary: (boolean) => void, setEnabled: (boolean) => void) => {
	return async (contracts: IContracts, account: string) => {
		await versionUpdater(account, contracts, setVersionBalances, setOldBalances, setPrimary, setEnabled)
	}
}

let versionUpdater = async (account: string, contracts: IContracts, setVersionBalances: ([]) => void, setOldBalances: (boolean) => void, setPrimary: (boolean) => void, setEnabled: (boolean) => void): Promise<void> => {
	const isPrimary: boolean = (await contracts.VersionController.primary.call({ from: account })).toLowerCase() === account.toLowerCase()
	setPrimary(isPrimary)
	setEnabled(await contracts.VersionController.isEnabled(contracts.activeVersion).call({ from: account }))

	var versionBalances = await API.populateVersionBalances(account, contracts)
	var oldBalances = (versionBalances.filter(version => ((parseFloat(version.actual) !== 0 || parseFloat(version.incubating) !== 0) && !version.enabled)).length > 0)
	setVersionBalances(versionBalances)
	setOldBalances(oldBalances)
}

function WalletContextProvider(props: any) {
	const [isMetamask, setIsMetamask] = useState<boolean>(false)
	const [connected, setConnected] = useState<boolean>(false)
	const [chainId, setChainId] = useState<number>(0)
	const [account, setAccount] = useState<string>('0x0')
	const [contracts, setContracts] = useState<IContracts>(DefaultContracts)
	const [versionBalances, setVersionBalances] = useState<[]>([])
	const [oldBalances, setOldBalances] = useState<boolean>(false)
	const [primary, setPrimary] = useState<boolean>(false)
	const [enabled, setEnabled] = useState<boolean>(false)
	const [loaded, setLoaded] = useState<boolean>(false)
	const [connectAction, setConnectAction] = useState<any>()
	const [initialized, setInitialized] = useState<boolean>(false)
	const chainVersionUpdate = chainVersionUpdater((input: []) => setVersionBalances(input), setOldBalances, setPrimary, setEnabled)


	useEffect(() => {
		if (chainId > 0 && account !== '0x0' && !initialized) {
			setInitialized(true)
			API.initialize(chainId, account)
				.then(c => {
					setContracts(c)
					chainVersionUpdate(c, account)
						.then(() => setInitialized(true))
						.catch(err => console.log('set version balance error: ' + err))
				})
		}
	}, [initialized])

	useEffect(() => {
		if (!window.ethereum || !window.ethereum.isMetaMask) {
			setIsMetamask(false)
			setConnected(false)
		} else if (window.ethereum.isMetaMask && !loaded) {
			setLoaded(true)
			setIsMetamask(true)
			API.web3 = new Web3(window.ethereum);

			let accountUpdateHandlerOnce = accountUpdater(setAccount, setConnected, () => { })
			let accountUpdateHandler = accountUpdater(setAccount, setConnected, setInitialized)
			window.ethereum.send('eth_accounts')
				.then(accountUpdateHandlerOnce)
				.then((acc) => {
					let chainIdUpdateHandlerOnce = chainIdUpdater(acc, setChainId, setContracts, chainVersionUpdate, () => { })
					let chainIdUpdateHandler = chainIdUpdater(acc, setChainId, setContracts, chainVersionUpdate, setInitialized)
					window.ethereum.send('eth_chainId')
						.then(chainIdUpdateHandlerOnce)
						.then(() => {
							window.ethereum.on('accountsChanged', accountUpdateHandler)
							window.ethereum.on('chainChanged', chainIdUpdateHandler)
						})
						.catch(err => console.log('chainId error ' + err))
				})
				.catch(err => {
					if (err.code === 4100) { // EIP 1193 unauthorized error
						console.log('Please connect to MetaMask.')
					} else {
						console.error(err)
					}
				})
			let connectionActionObject = {
				action: () => {
					window.ethereum.send('eth_requestAccounts')
						.then(accountUpdateHandler)
						.catch(err => {
							setConnected(false)
							if (err.code === 4001) {
								console.log('User rejected connection request. see EIP 1193 for more details.')
							} else {
								console.error('Unhandled wallet connection error: ' + err)
							}
						})
				}
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
		versionBalances,
		oldBalances,
		primary,
		enabled,
		initialized
	}
	WalletContext = React.createContext<walletProps>(providerProps);
	return <WalletContext.Provider value={providerProps}> {props.children}</WalletContext.Provider>

}


export { WalletContext, WalletContextProvider };
