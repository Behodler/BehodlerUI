import { Ownable } from '../Ownable'

export interface PyroWeth10Proxy extends Ownable {
    baseToken: () => any
    redeem: (amount: any) => any
    mint: (baseTokenAmount: any) => any
    calculateMintedPyroWeth: (baseTokenAmount: any) => any
    calculateRedeemedWeth: (amount: any) => any
    redeemRate: () => any
}