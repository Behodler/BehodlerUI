import Web3 from "web3";
import { EffectFactory, EffectFactoryType } from './common'

export default class {
	protected web3: Web3
	protected createEffect: EffectFactoryType
	constructor(web3: Web3, account: string) {
		this.web3 = web3
		this.createEffect = EffectFactory(web3, account)
	}
}