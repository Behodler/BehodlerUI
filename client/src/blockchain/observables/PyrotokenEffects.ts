import Web3 from "web3";
import { PyrotokenV2 } from '../contractInterfaces/behodler2/PyrotokenV2'

import { Effect, FetchNumberFields, FetchNumber } from './common'
import EffectBase from './EffectBase'

export class PyrotokenEffects extends EffectBase {
	pyroTokenInstance: PyrotokenV2

	constructor(web3: Web3, pyroToken: PyrotokenV2, account: string) {
		super(web3, account)
		this.pyroTokenInstance = pyroToken;
	}

	redeemRateEffect(): Effect {
		return this.createEffect(async ({ account, blockNumber }) => {
			const params: FetchNumberFields = {
				web3: this.web3,
				action: async (accounts) => await this.pyroTokenInstance.redeemRate().call({ from: accounts[0] }),
				defaultValue: "unset",
				accounts: [account]
			}
			return await FetchNumber(params)
		})
	}

	totalSupply(): Effect {
		return this.createEffect(async ({ account }) => {
			const params: FetchNumberFields = {
				web3: this.web3,
				action: async (accounts) => await this.pyroTokenInstance.totalSupply().call({ from: accounts[0] }),
				defaultValue: "unset",
				accounts: [account]
			}
			return await FetchNumber(params)
		})
	}
}
