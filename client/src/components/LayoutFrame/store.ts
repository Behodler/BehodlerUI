export interface LayoutStore {
	metaMaskEnabled: boolean
	metamaskConnected: boolean
	connectingAccount: boolean
}

export const initialState: LayoutStore = {
	metaMaskEnabled: false,
	metamaskConnected: false,
	connectingAccount: false
}
