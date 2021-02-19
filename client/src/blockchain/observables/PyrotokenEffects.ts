import Web3 from "web3";
import {Pyrotoken} from '../contractInterfaces/behodler2/Pyrotoken'

import { Effect, FetchNumberFields, FetchNumber } from './common'
import EffectBase from './EffectBase'

export class PyrotokenEffects extends EffectBase {
	pyroTokenInstance: Pyrotoken

	constructor(web3: Web3, pyroToken: Pyrotoken, account: string) {
		super(web3, account)
		this.pyroTokenInstance = pyroToken;
	}

	redeemRateEffect():Effect{
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
}
