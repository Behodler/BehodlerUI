
import { Observable, Observer, interval } from 'rxjs'
import Web3 from "web3";
export interface EffectFactoryType {
	(action: (params: { account: string, blockNumber: number }) => Promise<any>): Effect
}

export const EffectFactory = (web3: Web3, account: string): EffectFactoryType => (
	(action: (params: { account: string, blockNumber: number }) => Promise<any>): Effect => {
		const subscription = interval(15000)
		const observable = Observable.create(async (observer: Observer<any>) => {

			const queryBlockChain = async () => {
				return async (data) => {
					if (account === "0x0") {
						//observer.next("unset")
					}
					else {
						const currentResult = await action({ account, blockNumber:  await web3.eth.getBlockNumber()})
						observer.next(currentResult)
					}
				}
			}
			let blockNumber = await web3.eth.getBlockNumber()
			const initial = await queryBlockChain()
			await initial({ number: blockNumber })

			subscription.subscribe(initial)
		})
		return new Effect(observable.pipe(), subscription)
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
		if (this.subscription !== null && this.subscription.id !== null) {
			//	this.subscription.unsubscribe()
		}
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
		if (params.accounts.filter(a => a === "0x0").length > 0) {
			return params.defaultValue
		}
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
