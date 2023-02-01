import { useContext } from 'react'
import { UIContainerContext, WalletState } from '@behodler/sdk'

export const useWalletState = ():WalletState => useContext(UIContainerContext).walletState || {}
