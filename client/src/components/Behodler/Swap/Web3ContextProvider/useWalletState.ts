import { useContext } from 'react'
import { UIContainerContext } from '@behodler/sdk'
import { WalletState } from '@behodler/sdk/dist/types/wallet'

export const useWalletState = ():WalletState => useContext(UIContainerContext).walletState
