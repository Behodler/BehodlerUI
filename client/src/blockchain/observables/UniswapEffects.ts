import BigNumber from "bignumber.js";
import Web3 from "web3";
import { ERC20 } from "../contractInterfaces/ERC20";
import UniswapV2Pair from '../contractInterfaces/liquidQueue/UniswapV2Pair'

import { Effect, FetchNumberFields, FetchEthereumNumber } from './common'
import EffectBase from './EffectBase'


export class UniswapV2Effects extends EffectBase {
    private tokenPair: UniswapV2Pair
    private token1: ERC20
    private ONE: string
    constructor(web3: Web3, pair: ERC20, token1: UniswapV2Pair, account: string, ONE: string) {
        super(web3, account)
        this.tokenPair = pair;
        this.token1 = token1
        this.ONE = ONE
    }

    impliedProportionLPUnitsAbsoluteToken1(desiredQuantity: string): Effect {
        BigNumber.set({ EXPONENTIAL_AT: 18 });
        return this.createEffect(async ({ account }) => {
            const params: FetchNumberFields = {
                web3: this.web3,
                action: async (accounts) => {
                    const bigOne = BigInt(this.ONE)
                    const totalBalanceOfToken1 = BigInt((await this.token1.balanceOf(this.tokenPair.address).call()).toString())
                    const totalLPSupply = BigInt((await this.tokenPair.totalSupply().call()).toString())
                    const desiredRatio = (BigInt(desiredQuantity) * bigOne * bigOne) / totalBalanceOfToken1
                    const expectedLP = (totalLPSupply * desiredRatio) / (bigOne) //.div(this.ONE)
                    return expectedLP.toString()
                },
                defaultValue: "0",
                accounts: [account]
            }
            return await FetchEthereumNumber(params)
        })
    }

    impliedProportionLPUnitsPercentage(percentage: string): Effect {
        return this.createEffect(async ({ account }) => {
            const params: FetchNumberFields = {
                web3: this.web3,
                action: async (accounts) => {
                    const totalBalanceOfToken1 = BigInt((await this.tokenPair.balanceOf(account).call()).toString())
                    const expectedLP = totalBalanceOfToken1 * BigInt(percentage) / BigInt(100)
                    return expectedLP.toString()
                },
                defaultValue: "0",
                accounts: [account]
            }
            return await FetchEthereumNumber(params)
        })
    }
}