import Web3 from "web3";
import { WeiDai } from '../contractInterfaces/WeiDai';
import { EffectFactory, Effect, EffectFactoryType } from './common'

export class WeiDaiEffects {
	web3: Web3
	weiDaiInstance: WeiDai
	createEffect: EffectFactoryType

	constructor(web3: Web3, weiDaiInstance: WeiDai) {
		this.web3 = web3
		this.weiDaiInstance = weiDaiInstance
		this.createEffect = EffectFactory(web3)
	}

	totalSupplyEffect(): Effect {
		return this.createEffect(async (account) => {
			const resultHex = await this.weiDaiInstance.totalSupply().call({ from: account })
			const resultDecimal = this.web3.utils.hexToNumberString(resultHex["_hex"])
			return resultDecimal
		})
	}

	balanceOfEffect(holder: string): Effect {
		return this.createEffect(async (account) => {
			const resultHex = await this.weiDaiInstance.balanceOf(holder).call({ from: account })
			const resultDecimal = this.web3.utils.hexToNumberString(resultHex["_hex"])
			return resultDecimal
		})
	}

	allowance(owner: string, spender: string): Effect {
		return this.createEffect(async (account) => {
			const resultHex = await this.weiDaiInstance.allowance(owner, spender).call({ from: account })
			const resultDecimal = this.web3.utils.hexToNumberString(resultHex["_hex"])
			return resultDecimal
		})
	}
}
