/// <reference types="react-scripts" />

interface Window {
    ethereum?: {
        isMetaMask?: true
        on?: (...args: any[]) => void
        removeListener?: (...args: any[]) => void
        autoRefreshOnNetworkChange?: boolean
    }
    web3?: {}
}

declare module '*.mp4' {
    const src: string;
    export default src;
}
