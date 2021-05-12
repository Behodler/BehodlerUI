# Wallets integration

There are several wallet providers integrated to the Behodler Swap app:
* providers injected via browser extensions (eg. Metamask, full list can be found in the docs of [web3modal](https://github.com/Web3Modal/web3modal) package)
* WalletConnect
* WalletLink (Coinbase)
* Portis
* Fortmatic

Metamask and other injected providers should work out-of-the-box, the remaining providers require specifying some Node environment variables.

## WalletConnect

WalletConnect provider can be enabled in two ways:
1. By providing an [Infura Project ID](https://infura.io/docs/ethereum) via `REACT_APP_INFURA_ID` node environment variable
2. By providing a `chainId` to `rpcUrl` via `REACT_APP_RPC_CONFIGS` using the following syntax:

```
REACT_APP_RPC_CONFIGS=1|https://mainnet-rpc-url,3|https://ropsten-rpc-url
```

The above variable would be then interpreted as a js object:

```
{
    1: 'https://mainnet-rpc-url',
    3: 'https://ropsten-rpc-url',
}
```

The resulting object is passed directly to `walletconnect` provider as per [docs](https://docs.walletconnect.org/quick-start/dapps/web3-provider#rpc-url-mapping).

## WalletLink

WalletLink is enabled similarly to WalletConnect provider - by setting either `REACT_APP_INFURA_ID` or `REACT_APP_RPC_CONFIGS` env variables. 
The difference is, WalletLink [supports a single RPC URL value](https://github.com/walletlink/walletlink#initializing-walletlink-and-a-walletlink-powered-web3-object) - the Behodler's implementation requires specifying a network address mapped to `chainId` of `1` via `REACT_APP_RPC_CONFIGS`.

## Portis

Portis requires providing a `portisId` via `REACT_APP_PORTIS_ID` env variable. This alone is enough to use it with a mainnet account. 

Also, there is a possibility to connect to the local dev network - in order to do that, a `REACT_APP_CUSTOM_CHAIN_ID` env variable must be set to the `chaindId` value of the network.  

## Fortmatic

Fortmatic requires providing a Fortmatic Key via `REACT_APP_FORTMATIC_KEY` env variable.

Also, there is a possibility to connect to the local dev network - in order to do that, a `REACT_APP_CUSTOM_CHAIN_ID` env variable must be set to the `chaindId` value of the network.
