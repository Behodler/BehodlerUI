import Web3 from "web3";
import { Sisyphus } from '../contractInterfaces/behodler/Sisyphus/Sisyphus'
import { Scarcity } from '../contractInterfaces/behodler/Scarcity'


import { Effect, FetchEthereumNumber, FetchNumberFields } from './common'
import EffectBase from './EffectBase'

export class SisyphusEffects extends EffectBase {
    sisyphusInstance: Sisyphus
    scarcityInstance: Scarcity

    constructor(web3: Web3, sisyphusInstance: Sisyphus, scarcityInstance, account: string) {
        super(web3, account)
        this.sisyphusInstance = sisyphusInstance
        this.scarcityInstance = scarcityInstance
        console.log('sisyphys address ' + sisyphusInstance.address)
    }

    CurrentMonarch(caller: string): Effect {
        return this.createEffect(async ({ account }) => {
            return await this.sisyphusInstance.currentMonarch().call({ from: caller })
        })
    }

    BuyoutAmount(caller: string): Effect {
        return this.createEffect(async ({ account, blockNumber }) => {
            const params: FetchNumberFields = {
                web3: this.web3,
                defaultValue: "unset",
                action: async (accounts) => await this.sisyphusInstance.buyoutAmount().call({ from: caller }),
                accounts: [caller]
            }
            return await FetchEthereumNumber(params)
        })
    }

    CurrentBuyout(caller: string): Effect {
        return this.createEffect(async ({ account, blockNumber }) => {
            const params: FetchNumberFields = {
                web3: this.web3,
                defaultValue: "unset",
                action: async (accounts) => await this.sisyphusInstance.calculateCurrentBuyout().call({ from: caller }),
                accounts: [caller]
            }
            return await FetchEthereumNumber(params)
        })
    }

    SponsorPayment(caller: string): Effect {
        return this.createEffect(async ({ account, blockNumber }) => {
            const params: FetchNumberFields = {
                web3: this.web3,
                defaultValue: "unset",
                action: async (accounts) => await this.scarcityInstance.balanceOf(this.sisyphusInstance.address).call({ from: caller }),
                accounts: [caller]
            }
            return await FetchEthereumNumber(params)
        })
    }
}