import { Target } from './target'
import IContracts from '../../../../blockchain/IContracts'
import API from '../../../../blockchain/ethereumAPI'

export const wethProxyV2 = async (minting: boolean, contracts: IContracts): Promise<Target> => {
    const ONE = 1000000000000000000n
    const proxy = contracts.behodler.Behodler2.PyroWeth10Proxy
    console.log('proxy address ' + proxy.address)
    const pyroWethV2Address = await proxy.baseToken().call()
    const pyroWeth = await API.getPyroTokenV2(pyroWethV2Address)
    const weth = await pyroWeth.baseToken().call()
    return {
        baseAddress: weth,
        address: proxy.address,
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
                    const mintedWeth = BigInt(await proxy.calculateMintedPyroWeth(`${ONE}`).call())
                    return `${(ONE * ONE) / mintedWeth}`
                } else {
                    const redeemedWeth = BigInt(await proxy.calculateRedeemedWeth(`${ONE}`).call())
                    return `${(redeemedWeth * ONE) / ONE}`
                }
            }
            return {
                call: getRedeemRate
            }

        }
    }
}
