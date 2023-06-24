import API from '../../../../blockchain/ethereumAPI'
import { Target } from './target'

export const pv2 = async (address: string): Promise<Target> => {
    const pyroTokenV2Instance = await API.getPyroTokenV2(address)
    const baseAddress = await pyroTokenV2Instance.baseToken().call()
    return {
        baseAddress,
        address: pyroTokenV2Instance.address,
        redeem: (amount: string, account: string) => {
            return pyroTokenV2Instance.redeem(amount)
        }
        ,
        mint: (amount: string, account: string) => {
            return pyroTokenV2Instance.mint(amount)
        }
        ,
        redeemRate: () => {
            return pyroTokenV2Instance.redeemRate()
        }
    }
}
