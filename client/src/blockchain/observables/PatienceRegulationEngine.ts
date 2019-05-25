import Web3 from "web3";
import { PatienceRegulationEngine } from '../contractInterfaces/PatienceRegulationEngine'
import { Effect, FetchNumber, FetchNumberFields } from './common'
import EffectBase from './EffectBase'

export class PatienceRegulationEffects extends EffectBase {
	preInstance: PatienceRegulationEngine

	constructor(web3: Web3, instance: PatienceRegulationEngine) {
		super(web3)
		this.preInstance = instance
	}

	incubatingWeiDaiEffect(holder: string): Effect {
		return this.createEffect(async (account) => {
			const params: FetchNumberFields = {
				web3: this.web3,
				defaultValue: "unset",
				action: async (accounts) => await this.preInstance.getLockedWeiDai(accounts[0]).call({ from: accounts[1] }),
				accounts:[holder,account]
			}
			return await FetchNumber(params)
		})
	}
}