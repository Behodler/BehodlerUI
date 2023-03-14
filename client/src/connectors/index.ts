import { ChainId } from '@behodler/sdk'
import { Web3Provider } from '@ethersproject/providers'
import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'

import { NetworkConnector } from './NetworkConnector'

const RPC = {
    [ChainId.MAINNET]: 'https://eth-mainnet.alchemyapi.io/v2/q1gSNoSMEzJms47Qn93f9-9Xg5clkmEC',
    [ChainId.ROPSTEN]: 'https://eth-ropsten.alchemyapi.io/v2/cidKix2Xr-snU3f6f6Zjq_rYdalKKHmW',
    [ChainId.RINKEBY]: 'https://eth-rinkeby.alchemyapi.io/v2/XVLwDlhGP6ApBXFz_lfv0aZ6VmurWhYD',
    [ChainId.GÖRLI]: 'https://eth-goerli.alchemyapi.io/v2/Dkk5d02QjttYEoGmhZnJG37rKt8Yl3Im',
    [ChainId.KOVAN]: 'https://eth-kovan.alchemyapi.io/v2/6OVAa_B_rypWWl9HqtiYK26IRxXiYqER',
    [ChainId.FANTOM]: 'https://rpcapi.fantom.network',
    [ChainId.FANTOM_TESTNET]: 'https://rpc.testnet.fantom.network',
    [ChainId.MATIC]: 'https://rpc-mainnet.maticvigil.com',
    [ChainId.MATIC_TESTNET]: 'https://rpc-mumbai.matic.today',
    [ChainId.XDAI]: 'https://rpc.xdaichain.com',
    [ChainId.BSC]: 'https://bsc-dataseed.binance.org/',
    [ChainId.BSC_TESTNET]: 'https://data-seed-prebsc-2-s3.binance.org:8545',
    [ChainId.MOONBEAM_TESTNET]: 'https://rpc.testnet.moonbeam.network',
    [ChainId.AVALANCHE]: 'https://api.avax.network/ext/bc/C/rpc',
    [ChainId.AVALANCHE_TESTNET]: 'https://api.avax-test.network/ext/bc/C/rpc',
    [ChainId.HECO]: 'https://http-mainnet.hecochain.com',
    [ChainId.HECO_TESTNET]: 'https://http-testnet.hecochain.com',
    [ChainId.HARMONY]: 'https://explorer.harmony.one',
    [ChainId.HARMONY_TESTNET]: 'https://explorer.pops.one',
    [ChainId.OKEX]: 'https://exchainrpc.okex.org',
    [ChainId.OKEX_TESTNET]: 'https://exchaintestrpc.okex.org',
    [ChainId.GANACHE]: 'http://localhost:8545',
}

export const network = new NetworkConnector({
    defaultChainId: 1,
    urls: RPC
})

let networkLibrary: Web3Provider | undefined
export function getNetworkLibrary(): Web3Provider {
    return (networkLibrary = networkLibrary ?? new Web3Provider(network.provider as any))
}

export const injected = new InjectedConnector({
    supportedChainIds: [
        1, // mainnet
        3, // ropsten
        4, // rinkeby
        5, // goreli
        42, // kovan
        250, // fantom
        4002, // fantom testnet
        137, // matic
        80001, // matic testnet
        100, // xdai
        56, // binance smart chain
        97, // binance smart chain testnet
        1287, // moonbase
        43114, // avalanche
        43113, // fuji
        128, // heco
        256, // heco testnet
        1666600000, // harmony
        1666700000, // harmony testnet
        66, // okex testnet
        65, // okex testnet
        1337, // ganache local testnet
        11155111, // sepolia testnet
    ]
})

// mainnet only
export const walletconnect = new WalletConnectConnector({
    rpc: {
        [ChainId.MAINNET]: RPC[ChainId.MAINNET]
    },
    bridge: 'https://bridge.walletconnect.org',
    qrcode: true,
    pollingInterval: 15000
})
