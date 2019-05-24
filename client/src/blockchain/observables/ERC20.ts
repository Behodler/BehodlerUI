import Web3 from "web3";
import { ERC20 } from '../contractInterfaces/ERC20'
import { EffectFactory, Effect, EffectFactoryType, FetchNumber, FetchNumberFields } from './common'

export class ERC20Effects {
	web3: Web3
	tokenInstance: ERC20
	createEffect: EffectFactoryType

	constructor(web3: Web3, tokenInstance: ERC20) {
		this.web3 = web3
		this.tokenInstance = tokenInstance
		this.createEffect = EffectFactory(web3)
	}

	totalSupplyEffect(): Effect {
		return this.createEffect(async (account) => {
			const resultHex = await this.tokenInstance.totalSupply().call({ from: account })
			const resultDecimal = this.web3.utils.hexToNumberString(resultHex["_hex"])
			return resultDecimal
		})
	}

	balanceOfEffect(holder: string): Effect {
		return this.createEffect(async (account) => {
			const params: FetchNumberFields = {
				web3: this.web3,
				action: async () => { await this.tokenInstance.balanceOf(holder).call({ from: account }) },
				defaultValue: "0"
			}
			return await FetchNumber(params)
		})
	}

	allowance(owner: string, spender: string): Effect {
		return this.createEffect(async (account) => {
			const resultHex = await this.tokenInstance.allowance(owner, spender).call({ from: account })
			const resultDecimal = this.web3.utils.hexToNumberString(resultHex["_hex"])
			return resultDecimal
		})
	}
}
