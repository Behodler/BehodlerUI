import { zeroAddress } from "ethereumjs-util"

export interface TXReceipt {
    estimateGas(options: any, callback: (error: any, gas: any) => Promise<void>)
    send(options: any, callback: (error: any, hash: any) => Promise<void>)
}

export interface BlockChainStateRead {
    call(options: any): Promise<any>
}

export interface Target {
    redeem: (amount: string, account: string) => TXReceipt
    mint: (amount: string, account: string) => TXReceipt
    redeemRate: () => BlockChainStateRead
    address: string
    baseAddress: string
}
const defaultReceipt: TXReceipt = {
    estimateGas: (options: any, callback: (error: any, gas: any) => Promise<void>) => {
    },
    send: (options: any, callback: (error: any, hash: any) => Promise<void>) => {
    }
}

const defaultStateRead: BlockChainStateRead = {
    call: async (options: any) => {
        return "0"
    }
}
export const DefaultTarget: Target = {
    baseAddress: zeroAddress(),
    address: zeroAddress(),
    redeem: (amount: string, account: string) => {
        return defaultReceipt
    },
    mint: (amount: string, account: string) => {
        return defaultReceipt
    }
    ,
    redeemRate: () => {
        return defaultStateRead
    }
}