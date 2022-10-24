export interface TokenBalanceMapping {
    address: string
    balance: string
    name: string
}

export enum TXType {
    approval,
    mintPyro,
    redeemPyro
}

export interface PendingTX {
    hash: string
    type: TXType,
    token1: string
    token2: string
}

export interface TokenListItem {
    address: string
    name: string
    image: string
}

export interface IndependentField {
    target: 'TO' | 'FROM'
    newValue: string
}

export type FieldState = 'dormant' | 'updating dependent field' | 'validating swap'

export enum SwapState {
    IMPOSSIBLE,
    DISABLED,
    POSSIBLE
}
