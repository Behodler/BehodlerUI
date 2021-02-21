import Web3 from "web3";
import ScarcityBridge from '../contractInterfaces/morgoth/ScarcityBridge'
import { Effect, FetchNumber, FetchNumberFields } from './common'
import EffectBase from './EffectBase'


export class BridgeEffects extends EffectBase {
	bridgeInstance: ScarcityBridge

	constructor(web3: Web3, instance: ScarcityBridge, account: string) {
		super(web3, account)
		this.bridgeInstance = instance
	}

	exchangeRate(): Effect {
		return this.createEffect(async ({ account, blockNumber }) => {
			const params: FetchNumberFields = {
				web3: this.web3,
				defaultValue: "0",
				action: async (accounts) => {
					return await this.bridgeInstance.exchangeRate().call({ from: accounts[0] })
				},
				accounts: [account]
			}
			return await FetchNumber(params)
		})
	}
}