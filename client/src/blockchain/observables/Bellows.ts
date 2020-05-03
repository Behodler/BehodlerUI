import Web3 from "web3";
import { Bellows } from '../contractInterfaces/behodler/hephaestus/Bellows'
import { Effect, FetchNumberFields, FetchNumber } from './common'
import EffectBase from './EffectBase'

export class BellowsEffects extends EffectBase {
	bellowsInstance: Bellows

	constructor(web3: Web3, bellows: Bellows, account: string) {
		super(web3, account)
		this.bellowsInstance = bellows;
	}

	getRedeemRateEffect(pyroToken:string):Effect{
		return this.createEffect(async ({ account, blockNumber }) => {
			const params: FetchNumberFields = {
				web3: this.web3,
				action: async (accounts) => await this.bellowsInstance.getRedeemRate(pyroToken).call({ from: accounts[0] }),
				defaultValue: "unset",
				accounts: [account]
			}
			return await FetchNumber(params)
		})
	}
}
