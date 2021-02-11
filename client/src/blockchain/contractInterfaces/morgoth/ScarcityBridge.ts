import { BaseContract } from '../BaseContract';

export default interface ScarcityBridge extends BaseContract {
    exchangeRate: () => any
    swap: () => any
}