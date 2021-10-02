import { Web3ReactContextInterface } from '@web3-react/core/dist/types'
import { Web3Provider } from '@ethersproject/providers'
import { ChainId, useWeb3WalletContext, useWeb3NetworkContext } from '@behodler/sdk'

export function useActiveWeb3React(): Web3ReactContextInterface<Web3Provider> & { chainId?: ChainId } {
    const context = useWeb3WalletContext()
    const contextNetwork = useWeb3NetworkContext()
    return context.active ? context : contextNetwork
}

export default useActiveWeb3React
