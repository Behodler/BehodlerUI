import Web3 from "web3";
import { Faucet } from '../contractInterfaces/behodler/Sisyphus/Faucet'


import { Effect, FetchEthereumNumber, FetchNumberFields, FetchNumber } from './common'
import EffectBase from './EffectBase'

export class ScarcityFaucetEffects extends EffectBase {
    private faucetInstance:Faucet

    constructor(web3: Web3, faucetInstance: Faucet, account: string) {
        super(web3, account)
        this.faucetInstance = faucetInstance
    }

    lastRecipient(caller: string): Effect {
        return this.createEffect(async ({ account }) => {
            return await this.faucetInstance.lastRecipient().call({ from: caller })
        })
    }

    dripsRemaining(caller: string): Effect {
        return this.createEffect(async ({ account, blockNumber }) => {
            const params: FetchNumberFields = {
                web3: this.web3,
                defaultValue: "unset",
                action: async (accounts) => await this.faucetInstance.dripsRemaining().call({ from: caller }),
                accounts: [caller]
            }
            return await FetchNumber(params)
        })
    }

    dripsSize(caller: string): Effect {
        return this.createEffect(async ({ account, blockNumber }) => {
            const params: FetchNumberFields = {
                web3: this.web3,
                defaultValue: "unset",
                action: async (accounts) => await this.faucetInstance.dripSize().call({ from: caller }),
                accounts: [caller]
            }
            return await FetchEthereumNumber(params)
        })
    }

    lastDrip(caller: string): Effect {
        return this.createEffect(async ({ account, blockNumber }) => {
            const params: FetchNumberFields = {
                web3: this.web3,
                defaultValue: "unset",
                action: async (accounts) => await this.faucetInstance.lastDrip().call({ from: caller }),
                accounts: [caller]
            }
            const last = await FetchNumber(params)
            return {last,blockNumber}
        })
    }

    
}