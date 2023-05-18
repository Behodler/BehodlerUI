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

export enum V2BalanceState {
    unset,
    has,
    hasNot
}

export interface CoherentModel {
    hasV2Balance: boolean
    V2BalanceState: V2BalanceState

    inputEnabled: boolean
    inputAddress: string
    outputAddress: string
    independentField: IndependentField
    independentFieldState: FieldState
    inputText: string
    outputText: string
    swapState: SwapState
    minting: boolean
    inputSpotDaiPriceView: string
    outputSpotDaiPriceView: string
    swapClicked: boolean
    impliedExchangeRate: string
    flipClicked: boolean
}

export type actionTypes ='SPOTPRICE' | 'UPDATE_HAS_V2_BALANCE' |
'UPDATE_INPUT_ADDRESS' | 'UPDATE_OUTPUT_ADDRESS' |
'UPDATE_INPUT_TEXT'
| 'UPDATE_OUTPUT_TEXT'
| 'UPDATE_SWAP_STATE'
| 'UPDATE_DEPENDENT_FIELD' |
'UPDATE_INDEPENDENT_FIELD'
| 'UPDATE_INDEPENDENT_FIELD_STATE' |
'UPDATE_INPUT_ENABLED' | 'SET_SWAP_CLICKED' | 'MARK_HAS_V2_BALANCE_STALE'
| 'UPDATE_MINTING'
| 'SET_IMPLIED_EXCHANGE_RATE' | 'BATCH_UPDATE' | 'SET_FLIP_CLICKED'

export interface actions {
    type: actionTypes,
    payload?: any
}

export const modelTypes = {
    "string": "",
    "boolean": true,
    "TO": "TO",
    "FROM": "FROM",
    "dormant": "dormant",
    "updating dependent field": "updating dependent field",
    "validating swap": "validating swap",
    "IMPOSSIBLE": SwapState.IMPOSSIBLE,
    "DISABLED": SwapState.DISABLED,
    "POSSIBLE": SwapState.POSSIBLE,
    "bigint": BigInt(0),
    "symbol": Symbol(),
    "undefined": undefined,
    "number": 0
};

type TypeKey = keyof typeof modelTypes;

export function getPayloadValue<T>(type: TypeKey, value: T): T {
    if (value === null || value === undefined) {
        throw new Error(`Value is null or undefined`);
    } else if (typeof value !== typeof modelTypes[type]) {
        throw new Error(`Value ${value} is not of type ${type}`);
    }
    return value;
}
