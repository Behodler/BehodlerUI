import API from '../../../../blockchain/ethereumAPI'
import { Target } from './target'

export const pv3 = async (address: string): Promise<Target> => {
    const pyroTokenV3Instance = await API.getPyroTokenV3(address)
    const baseAddress = (await pyroTokenV3Instance.config().call())[1]
    return {
        baseAddress,
        address: pyroTokenV3Instance.address,
        redeem: (amount: string, account: string) => {
            return pyroTokenV3Instance.redeem(amount, account)
        }
        ,
        mint: (amount: string, account: string) => {
            return pyroTokenV3Instance.mint(amount, account)
        }
        ,
        redeemRate: () => {
            return pyroTokenV3Instance.redeemRate()
        }
    }
}
