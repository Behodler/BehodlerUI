import { BaseContract } from '../BaseContract';
import { uint } from '../SolidityTypes'

export default interface ScarcityBridge extends BaseContract {
    exchangeRate: () => any
    swap: (scx1: uint) => any
}