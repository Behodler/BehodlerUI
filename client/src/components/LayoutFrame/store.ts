import {IWalletStore, initialState as walletInitialState} from './InfoPanel/WalletSection/store'

export interface  LayoutStore extends IWalletStore{ 

}

export const  initialState = {...walletInitialState}