import { address } from '../SolidityTypes'
import { BaseContract } from '../BaseContract'

type LimboProxyAddress = address
type BehodlerProxyAddress = address

export interface TokenProxyRegistry extends BaseContract {
    tokenProxy: (address: address) => [LimboProxyAddress, BehodlerProxyAddress]
}
