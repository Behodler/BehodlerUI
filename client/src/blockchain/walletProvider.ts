import Web3Modal, { IProviderOptions, isMobile } from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import coinbaseWalletIcon from '../customIcons/coinbase-wallet.svg';
import { WalletLink } from 'walletlink';
import * as Portis from '@portis/web3';
import * as Fortmatic from 'fortmatic';
import API from './ethereumAPI';
import Web3 from 'web3';

const {
  REACT_APP_INFURA_ID: INFURA_ID,
  REACT_APP_PORTIS_ID: PORTIS_ID,
  REACT_APP_RPC_CONFIGS: RPC_CONFIGS,
  REACT_APP_FORTMATIC_KEY: FORTMATIC_KEY,
  REACT_APP_CUSTOM_CHAIN_ID: CUSTOM_CHAIN_ID,
} = process.env;

export const convertRPCConfigsStringToObject = rpcConfigs => (
  Object
    .fromEntries((
      rpcConfigs
        .split(',')
        .map(chainIdToUrlString => chainIdToUrlString.split('|'))
    ))
);

export const initWeb3Modal = () => {
  let providerOptions: IProviderOptions = {}

  const rpcConfig = RPC_CONFIGS
    ? convertRPCConfigsStringToObject(RPC_CONFIGS)
    : undefined

  const mainnetRpc = rpcConfig && rpcConfig[1];

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
          description: !isMobile()
            ? 'Scan with WalletLink to connect'
            : 'Open in Coinbase Wallet app',
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

  if (PORTIS_ID && !isMobile()) {
    const portisCustomNodeOptions = (
      PORTIS_ID && CUSTOM_CHAIN_ID && rpcConfig && rpcConfig[CUSTOM_CHAIN_ID]
        ? {
          nodeUrl: rpcConfig[CUSTOM_CHAIN_ID],
          chainId: parseInt(CUSTOM_CHAIN_ID, 10),
        }
        : undefined
    );

    providerOptions.portis = {
      package: Portis,
      options: {
        id: PORTIS_ID,
        network: portisCustomNodeOptions,
      }
    }
  }

  if (FORTMATIC_KEY) {
    const fortmaticCustomNodeOptions = (
      FORTMATIC_KEY && CUSTOM_CHAIN_ID && rpcConfig && rpcConfig[CUSTOM_CHAIN_ID]
        ? {
          rpcUrl: rpcConfig[CUSTOM_CHAIN_ID],
          chainId: parseInt(CUSTOM_CHAIN_ID, 10),
        }
        : undefined
    );

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

export const getDisconnectProviderFn = (provider, handleWalletDisconnected): any => {
  const triggerCommonDisconnectFn = async (message) => {
    if (typeof provider.disconnect === 'function') await provider.disconnect()
    if (typeof provider.close === 'function') await provider.close()

    handleWalletDisconnected(`: ${message}`)
    /*
    * it seems that using a wallet provider API to logout/disconnect usually doesn't
    * end up with desired outcome: Portis still pulls from Infura API,
    * walletconnect QR code popup shows up after a disconnection, in overall - there
    * are some unhandled left-overs. Reloading the page resolves the issues.
    */
    setTimeout(() => window.location.reload())
  }

  if (provider.isMetaMask) {
    return async () => {
      provider.emit('disconnect')
      await triggerCommonDisconnectFn('Metamask disconnected by user')
    }
  } else if (provider.isPortis) {
    return async () => {
      await provider._portis.logout()
      await triggerCommonDisconnectFn('Portis disconnected by user')
    }
  } else if (provider.wc) {
    return async () => {
      await triggerCommonDisconnectFn('Walletconnect provider disconnected by user')
    }
  } else if (provider.isWalletLink) {
    return async () => {
      await triggerCommonDisconnectFn('Walletlink provider disconnected by user')
    }
  } else if (provider.isFortmatic) {
    return async () => {
      if (provider.fm.user && typeof provider.fm.user.logout === 'function') await provider.fm.user.logout()
      await triggerCommonDisconnectFn('Fortmatic disconnected by user')
    }
  }

  return
}

export const createConnectWalletFn = (web3Modal, setConnected, setDisconnectAction, setConnecting, updateAccount, updateChainId) => async () => {
  if (!INFURA_ID && !RPC_CONFIGS) {
    console.info('Neither REACT_APP_INFURA_ID nor REACT_APP_RPC_CONFIGS environment variable is set. One of these are required in order for WalletConnect and WalletLink providers to work.')
  }

  if (!PORTIS_ID) {
    console.info('REACT_APP_PORTIS_ID environment variable is not set. It is required in order for Portis wallet provider to work.')
  }

  if (!FORTMATIC_KEY) {
    console.info('REACT_APP_FORTMATIC_KEY environment variable is not set. It is required in order for Fortmatic wallet provider to work.')
  }

  const providerButtonDOMElements = document
    .querySelectorAll('.web3modal-provider-container') || []

  const displayLoader = () => setConnecting(true);

  const handleWalletDisconnected = (info: any = null) => {
    console.log('wallet provider disconnected', info)

    setConnecting(false)
    setConnected(false)
    web3Modal.clearCachedProvider()
    providerButtonDOMElements.forEach(el => el.removeEventListener('click', displayLoader))
  }

  let provider


  try {
    providerButtonDOMElements.forEach(el => el.addEventListener('click', displayLoader))
    provider = await web3Modal.connect()
    API.web3 = new Web3(provider)
  } catch (error) {
    handleWalletDisconnected(error)
  }

  if (!provider) {
    setConnecting(false)
    return;
  }

  const disconnectFn = getDisconnectProviderFn(provider, handleWalletDisconnected);

  if (typeof disconnectFn === 'function') {
    setDisconnectAction({ action: disconnectFn })
  }

  try {
    const chainId = provider.isPortis
      ? provider._portis.config.network.chainId
      : provider.chainId || provider._chainId || CUSTOM_CHAIN_ID || 1
    const accounts = await API.web3.eth.getAccounts()

    updateAccount(accounts)
    updateChainId(chainId, true)

    const handleWalletConnected = (info: { chainId: number }) => {
      console.log('wallet provider connected', {
        info,
        provider,
        web3Modal,
      })
    }

    if (provider && typeof provider.on === 'function') {
      provider.on("accountsChanged", () => updateAccount(accounts, web3Modal))
      provider.on("chainChanged", () => updateChainId(chainId))
      provider.on("connect", handleWalletConnected)
      provider.on("disconnect", handleWalletDisconnected)
    }

    setConnecting(false)
  } catch (error) {
    handleWalletDisconnected()

    if (error.code === 4001) {
      console.info('User rejected connection request. see EIP 1193 for more details.')
    } else {
      console.error('Unhandled wallet connection error: ' + error)
    }
  }
}
