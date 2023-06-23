import { Target } from './target'
import IContracts from '../../../../blockchain/IContracts'

export const wethProxyV2 = async (minting: boolean, contracts: IContracts): Promise<Target> => {
    const ONE = 1000000000000000000n
    const proxy = contracts.behodler.Behodler2.PyroWeth10Proxy
    const baseAddress =await proxy.baseToken().call()
    return {
        baseAddress,
        address:proxy.address,
        redeem: (amount: string, account: string) => {
            return proxy.redeem(amount)
        }
        ,
        mint: (amount: string, account: string) => {
            return proxy.mint(amount)
        }
        ,
        redeemRate: () => {
            const getRedeemRate = async (): Promise<string> => {
                if (minting) {
                    const mintedWeth = await proxy.calculateMintedPyroWeth(`${ONE}`).call()
                    return `${(ONE * ONE) / mintedWeth}`
                } else {
                    const redeemedWeth = await proxy.calculateRedeemedWeth(`${ONE}`).call()
                    return `${(redeemedWeth * ONE) / ONE}`
                }
            }
            return {
                call: getRedeemRate
            }

        }
    }
}
