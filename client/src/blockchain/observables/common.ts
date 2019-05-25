
import { Observable } from 'rxjs'
import Web3 from "web3";

export interface EffectFactoryType {
	(action: (account: string) => Promise<string>): Effect
}

export const EffectFactory = (web3: Web3): EffectFactoryType => (
	(action: (account: string) => Promise<string>): Effect => {
		const subscription = web3.eth.subscribe("newBlockHeaders")
		const observable = Observable.create(async (observer) => {
			const queryBlockChain = async () => {
				let account = (await web3.eth.getAccounts())[0]
				if (account === "0x0") {
					observer.next("unset")
				}
				else {
					const currentResult = await action(account)
					observer.next(currentResult)
				}
			}
			await queryBlockChain()
			subscription.on('data', queryBlockChain)
		})
		return new Effect(observable, subscription)
	}
)

export class Effect {
	private subscription: any
	public Observable: Observable<string>
	public constructor(Observable: Observable<string>, subscription: any) {
		this.subscription = subscription
		this.Observable = Observable
	}

	cleanup() {
		if (this.subscription !== null && this.subscription.id !== null)
			this.subscription.unsubscribe()
	}
}

export interface FetchNumberFields {
	web3: Web3
	action: (accounts: string[]) => Promise<any>
	defaultValue: string
	accounts: string[]
}

export const FetchNumber = async (params: FetchNumberFields) => {
	try {
		if (params.accounts.filter(a => a === "0x0").length > 0)
			return params.defaultValue
		const resultHex = await params.action(params.accounts)
		if (!resultHex)
			return params.defaultValue
		const resultDecimal = params.web3.utils.hexToNumberString(resultHex["_hex"])
		return params.web3.utils.fromWei(resultDecimal)
	} catch (error) {
		console.error(error)
		return params.defaultValue
	}
}
