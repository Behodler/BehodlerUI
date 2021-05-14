# Supported wallet providers

There are several wallet providers integrated into Behodler swap client app:
* providers injected via browser extensions (eg. Metamask, full list can be found in the docs of [web3modal](https://github.com/Web3Modal/web3modal) package)
* WalletConnect
* WalletLink (Coinbase)
* Portis
* Fortmatic

Metamask and other injected providers should work out of the box if a user uses related browser extension, the remaining providers require specifying some Node environment variables.

## WalletConnect

WalletConnect provider can be enabled in the following way:
1. By providing an [Infura Project ID](https://infura.io/docs/ethereum) via `REACT_APP_INFURA_ID` node environment variable
2. By providing a map of `chainId` number to `rpcUrl` value via `REACT_APP_RPC_CONFIGS` using the following syntax:

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

The resulting object is passed directly to `walletconnect` provider as per [walletconnect docs](https://docs.walletconnect.org/quick-start/dapps/web3-provider#rpc-url-mapping).

## WalletLink

WalletLink is enabled similarly to WalletConnect provider - by setting either `REACT_APP_INFURA_ID` or `REACT_APP_RPC_CONFIGS` env variables.
The difference is, WalletLink [supports a single RPC URL value](https://github.com/walletlink/walletlink#initializing-walletlink-and-a-walletlink-powered-web3-object) - the Behodler's implementation requires specifying a network address mapped to `chainId` of `1` via `REACT_APP_RPC_CONFIGS` - in other words, only the Ethereum Mainnent network is supported for this wallet provider.

## Portis

Portis requires providing a [Portis ID](https://dashboard.portis.io/) via `REACT_APP_PORTIS_ID` env variable. This alone is enough to use it with a mainnet account.

Also, there is a possibility to connect to the local dev network - in order to do that, a `REACT_APP_CUSTOM_CHAIN_ID` env variable must be set to the `chaindId` value of the network.

## Fortmatic

Fortmatic requires providing a [Fortmatic Key](https://dashboard.fortmatic.com) via `REACT_APP_FORTMATIC_KEY` env variable. Similar to Portis, this is enough to use Fortmatic wallet on mainnet.

In order to use a local dev network, a `REACT_APP_CUSTOM_CHAIN_ID` env variable must be set to the `chaindId` value of the network.

# Using supported wallets with the Ethereum Mainnet network

Required Node env variables must be provided to the client app:
```
REACT_APP_INFURA_ID=your_infura_id
REACT_APP_PORTIS_ID=your_portis_id
REACT_APP_FORTMATIC_KEY=your_fortmatic_live_key
```
or
```
REACT_APP_PORTIS_ID=your_portis_id
REACT_APP_RPC_CONFIGS=1|https://mainnet.infura.io/v3/your_infura_id
REACT_APP_FORTMATIC_KEY=your_fortmatic_live_key
```

Providing valid values via `REACT_APP_INFURA_ID` or `REACT_APP_RPC_CONFIGS` enables `walletconnect` and `walletlink` providers. `REACT_APP_PORTIS_ID` is required by Portis, and `REACT_APP_FORTMATIC_KEY` is required by Fortmatic.

When using `REACT_APP_RPC_CONFIGS`, you can use any URL that provides access to an ETH node, e.g. [https://eth-mainnet.alchemyapi.io/v2/your-api-key](https://docs.alchemy.com/).

# Developing and testing wallet provider integrations using a local Ganache node

* Install dependencies (unless you already did)
    ```
    npm run install:docker
    ```
    or
    ```
    yarn install:docker
    ```
   
* Enable wallet providers by setting up the related Node env variables. The following configuration allows using Metamask, Portis, and Fortmatic with the local Ganache network, Mainnet config can be found below
    ```
    REACT_APP_PORTIS_ID=your_portis_id
    REACT_APP_RPC_CONFIGS=1337|http://localhost:8545
    REACT_APP_FORTMATIC_KEY=your_fortmatic_test_key
    REACT_APP_CUSTOM_CHAIN_ID=1337
    ```

* Start docker containers for the Ganache network and the client app.
    ```
   npm run start:dev
   ```
  
   This command uses docker compose utility to start both the local Ethereum node and the client app inside docker containers. This approach has a flow, though (at least on my environment) - changing local files does not result in updating the app in the browser. Manually refreshing browser does not help either, docker container running the client has to be restarted.

* Start the Ganache network inside the docker container and start the client app outside the docker container.
  
    Go to the `client` directory and run the following bash command:   
    ```
    rm -rf behodlerDB && cp -r behodlerDB_orig behodlerDB && cp src/temp/BehodlerABIAddressMappingDev.json src/temp/BehodlerABIAddressMapping.json && docker-compose up --remove-orphans  -d ganache
    ```

    Then, run the client app:
    ```
   ./node_modules/react-scripts/bin/react-scripts.js start
   ```
    

