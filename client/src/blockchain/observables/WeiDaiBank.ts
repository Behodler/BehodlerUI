import Web3 from "web3";
import { WeiDaiBank } from '../contractInterfaces/WeiDaiBank'
import { Effect, FetchNumber, FetchNumberFields } from './common'
import EffectBase from './EffectBase'


export class BankEffects extends EffectBase {
	bankInstance: WeiDaiBank

	constructor(web3: Web3, instance: WeiDaiBank, account: string) {
		super(web3, account)
		this.bankInstance = instance
	}

	daiPerMyriadWeidaiEffect(): Effect {
		return this.createEffect(async ({ account, blockNumber }) => {
			const params: FetchNumberFields = {
				web3: this.web3,
				defaultValue: "unset",
				action: async (accounts) => await this.bankInstance.daiPerMyriadWeidai().call({ from: accounts[0] }),
				accounts: [account]
			}
			return await FetchNumber(params)
		})
	}
}