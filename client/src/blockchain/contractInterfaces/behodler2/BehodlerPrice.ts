import { uint } from '../SolidityTypes'

export interface BehodlerPrice {
    addLiquidity: (amount: uint, amountInPool: uint, burnFee: uint) => any
}