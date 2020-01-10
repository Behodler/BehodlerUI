
import { Observable, Observer } from 'rxjs'
import { distinctUntilChanged } from 'rxjs/operators'
import Web3 from "web3";
export interface EffectFactoryType {
	(action: (params: { account: string, blockNumber: number }) => Promise<any>): Effect
}

export const EffectFactory = (web3: Web3, account: string): EffectFactoryType => (
	(action: (params: { account: string, blockNumber: number }) => Promise<any>): Effect => {
		const subscription = web3.eth.subscribe("newBlockHeaders")
		const observable = Observable.create(async (observer: Observer<any>) => {
			const queryBlockChain = async (data) => {
				if (account === "0x0") {
					observer.next("unset")
				}
				else {
					const currentResult = await action({ account, blockNumber: data.number })
					observer.next(currentResult)
				}
			}
			let blockNumber = await web3.eth.getBlockNumber()
			await queryBlockChain({ number: blockNumber })

			subscription.on('data', queryBlockChain)
		})

		return new Effect(observable.pipe(distinctUntilChanged()), subscription)
	}
)

export class Effect {
	private subscription: any
	public Observable: Observable<any>
	public constructor(Observable: Observable<any>, subscription: any) {
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
		return params.web3.utils.hexToNumberString(resultHex["_hex"])
	} catch (error) {
		console.error(error)
		return params.defaultValue
	}
}

export const FetchEthereumNumber = async (params: FetchNumberFields) => {
	const value = await FetchNumber(params)
	if (value === params.defaultValue)
		return params.defaultValue
	return params.web3.utils.fromWei(value)
}
