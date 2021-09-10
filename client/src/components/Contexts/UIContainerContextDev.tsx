import { UIContainerContextProps, UserState } from '@behodler/sdk/dist/types'
import { AbstractConnector } from '@web3-react/abstract-connector';
import * as React from 'react'
import { useState, useEffect, useCallback } from 'react'
import API from '../../blockchain/ethereumAPI'
import { AbstractConnectorArguments, ConnectorUpdate } from '@web3-react/types';
import { Web3ReactContextInterface } from '@web3-react/core/dist/types';
import { WalletState } from '@behodler/sdk/dist/types/wallet';
import { TransactionResponse } from '@ethersproject/providers';
import Web3 from 'web3';


const defaultWeb3ContextProps: Web3ReactContextInterface = {
    activate: (connector: AbstractConnector, onError?: (error: Error) => void, throwErrors?: boolean) => {
        return new Promise<void>((resolve, reject) => {
            resolve()
        })
    },
    deactivate: () => { },
    setError: (error: Error) => { },
    active: false
}

const defaultUIContainerContextProps = {
    walletContext: defaultWeb3ContextProps,
    networkContext: defaultWeb3ContextProps,
    walletState: getWalletState(() => { }),
    userState: { userDarkMode: false }
}


let ContainerContext = React.createContext<UIContainerContextProps>(defaultUIContainerContextProps)

interface props {
    chainId: number
    setChainId: (id: number) => void
    account: string
    setAccount: (account: string) => void
    children?: any
}

function UIContainerContextDevProvider(props: props) {
    const [walletTrigger, setWalletTrigger] = useState<number>()
    const provider: any = (window as any).ethereum
    const [walletContext, setWalletContext] = useState<Web3ReactContextInterface>(defaultWeb3ContextProps)
    const [networkContext, setNetworkContext] = useState<Web3ReactContextInterface>(defaultWeb3ContextProps)
    const [walletState, setWalletState] = useState<WalletState>(getWalletState(setWalletTrigger))
    const [active, setActive] = useState<boolean>(false)
    // const [userState,setUserState] = useState<UserState>({userDarkMode:false})
    const userState: UserState = { userDarkMode: false }

    const walletCallBack = useCallback(async () => {
        setWalletContext(await getWalletContext(provider, props.setChainId, props.setAccount, active, setActive))
    }, [(window as any).ethereum, props.chainId, props.account, walletTrigger])

    useEffect(() => {
        walletCallBack()
    }, [(window as any).ethereum, props.chainId, props.account, walletTrigger])

    const networkCallBack = useCallback(async () => {
        setNetworkContext(await getNetworkContext(provider, props.setChainId))
    }, [(window as any).ethereum, props.chainId])

    useEffect(() => {
        networkCallBack()
    }, [(window as any).ethereum, props.chainId])

    const walletStateCallback = useCallback(async () => {
        setWalletState(await getWalletState(setWalletTrigger))
    }, [props.account])

    useEffect(() => {
        walletStateCallback()
    }, [props.account])

    const containerContextProps: UIContainerContextProps = {
        walletContext,
        networkContext,
        walletState,
        userState
    }

    ContainerContext = React.createContext<UIContainerContextProps>(containerContextProps)
    return <ContainerContext.Provider value={containerContextProps}>{props.children}</ContainerContext.Provider>
}

export { UIContainerContextDevProvider, ContainerContext }

async function getWalletContext(provider: any, setChainId: (id: number) => void, setAccount: (account: string) => void, active: boolean, setActive: (a: boolean) => void): Promise<Web3ReactContextInterface> {

    const connector = new MetamaskConnector({ supportedChainIds: [1, 3, 4, 5, 42] }, window as any, setAccount, setChainId)
    const update = await connector.activate()


    const chainId: number | undefined = update.chainId === undefined ? undefined : parseInt(update.chainId.toString())

    const account: string | null | undefined = update.account
    const activate: (connector: AbstractConnector, onError?: (error: Error) => void, throwErrors?: boolean) => Promise<void> =
        async (connector: AbstractConnector, onError?: (error: Error) => void, throwErrors?: boolean): Promise<void> => {

            const update = await connector.activate()
            if (!update.chainId || !update.account) {
                setActive(false)
                if (onError && throwErrors) {
                    console.log('chain connection failed')
                }
            }
            else {
                setActive(true)
            }
        }
    return {
        connector,
        chainId: chainId,
        account,
        active,
        activate,
        setError: (error: Error) => { console.log(error.stack) },
        deactivate: () => { }
    }
}

async function getNetworkContext(provider: any, setChainId): Promise<Web3ReactContextInterface> {
    const connector = new MetamaskConnector({ supportedChainIds: [1, 3, 4, 5, 42] }, window as any, undefined, setChainId)
    const update = await connector.activate()

    const chainId: number | undefined = update.chainId === undefined ? undefined : parseInt(update.chainId.toString())

    const account: string | null | undefined = update.account
    const activate: (connector: AbstractConnector, onError?: (error: Error) => void, throwErrors?: boolean) => Promise<void> =
        async (connector: AbstractConnector, onError?: (error: Error) => void, throwErrors?: boolean): Promise<void> => {
            const update = await connector.activate()
            if (update.chainId === undefined && onError && throwErrors) {
                console.log('chain connection failed')
            }
        }
    return {
        connector,
        chainId: chainId,
        account,
        active: true,
        activate,
        setError: (error: Error) => { console.log(error.stack) },
        deactivate: () => { }
    }
}

function getWalletState(setWalletTrigger: (t: number) => void): WalletState {
    const state: WalletState = {
        toggleWalletModal: () => {
            setWalletTrigger(new Date().getTime())
        },
        transactions: {
            ["0x0"]: {
                hash: "0x0", addedTime: 10, from: "0x0"
            },
        },
        addTransaction(response: TransactionResponse) {
            response.wait().then(() => {
                console.log("Transaction mined")
            })
        }
    }

    return state
}


class MetamaskConnector extends AbstractConnector {

    private window: any;
    private accountId: null | string | undefined
    private chainId: number
    private accountChangeListener?: (accounts: string) => void;
    private chainChangeListener?: (chainId: number) => void;
    constructor({ supportedChainIds }: AbstractConnectorArguments, window: any, accountChangeListener?: (accounts: string) => void, chainChangeListener?: (chainId: number) => void) {
        super({ supportedChainIds })
        this.window = window
        if (accountChangeListener) {
            this.accountChangeListener = (account: string) => {
                this.accountId = account
                accountChangeListener(account)
            }
        }

        if (chainChangeListener) {
            this.chainChangeListener = (id: number) => {
                this.chainId = id
                chainChangeListener(id)
            }
        }
    }

    metamaskIsInstalled(): boolean {
        return !!this.window.ethereum
    }

    async activate(): Promise<ConnectorUpdate> {
        let update: ConnectorUpdate = {}
        const connectResponse = await this.window.ethereum.request({ method: 'eth_accounts' })

        if (this.accountChangeListener) {
            if (connectResponse && connectResponse.length > 0) {
                API.web3 = new Web3(this.window.ethereum)
                const chainResponse = await this.window.ethereum.request({ method: 'eth_chainId' })

                update.chainId = API.pureHexToNumber(chainResponse)
                update.account = connectResponse[0]
                update.provider = this.window.ethereum
                if (this.accountChangeListener) {
                    if (update.account)
                        this.accountChangeListener(update.account)
                    this.window.ethereum.on('accountsChanged', this.accountChangeListener)
                }
                else
                    console.error("account listener not connected.")
                if (this.chainChangeListener) {
                    this.chainChangeListener(update.chainId)
                    this.window.ethereum.on('chainChanged', this.chainChangeListener)
                }
                else
                    console.error("chain listener not connected.")

            }
        } else if (this.window.ethereum && this.window.ethereum.isMetaMask && this.chainChangeListener) {
            this.window.ethereum.on('chainChanged', this.chainChangeListener)
        }
        return update
    }


    getProvider(): Promise<any> {
        return this.window.ethereum
    }
    getChainId(): Promise<number | string> {
        return Promise.resolve(this.chainId)
    }

    getAccount(): Promise<null | string> {
        return Promise.resolve(this.accountId || null)
    }

    deactivate() {

    };
    // protected emitUpdate(update: ConnectorUpdate): void;
    // protected emitError(error: Error): void;
    // protected emitDeactivate(): void;
}
