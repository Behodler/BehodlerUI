import { Target } from './target'
import IContracts from '../../../../blockchain/IContracts'
import API from 'src/blockchain/ethereumAPI'

export const wethProxyV3 = async (contracts: IContracts): Promise<Target> => {
    const ONE = 1000000000000000000n
    const proxy = contracts.behodler.Behodler2.PyroWethProxy

    const pyroWethAddress = await proxy.pyroWeth().call()
    const pyroWeth = await API.getPyroTokenV3(pyroWethAddress)
    const wethAddress = (await pyroWeth.config().call())[1]

    const weth = await API.getToken(wethAddress)
    return {
        baseAddress: wethAddress,
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
                const totalSupply = BigInt(await pyroWeth.totalSupply().call())
                const reserveOnLR = BigInt(await weth.balanceOf(contracts.behodler.Behodler2.LiquidityReceiverV3.address).call())
                const reserveOnPyro = BigInt(await weth.balanceOf(pyroWethAddress).call())
                const reserve = reserveOnLR + reserveOnPyro
                return totalSupply == 0n ? `${ONE}` : `${(reserve * ONE) / totalSupply}`
            }
            return {
                call: getRedeemRate
            }
        }
    }
}
