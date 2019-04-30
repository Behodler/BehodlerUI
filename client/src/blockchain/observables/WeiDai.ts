import { Observable } from 'rxjs'
import Web3 from "web3";
import { WeiDai } from '../contractInterfaces/WeiDai';
import { LockSubscription } from './common'
interface ObservableCollection {
	unsubscribe: () => void
	create: (ethSubscription: any, weiDaiInstance: WeiDai, primaryAccount: string) => void
}

export interface ERC20ObservableCollection extends ObservableCollection {
	totalSupply: Observable<any>
	balanceOf: Observable<any>
	allowance: Observable<any>
	name: Observable<any>
	symbol: Observable<any>
	decimals: Observable<any>
}

export class WeiDaiObservableCollection implements ERC20ObservableCollection {
	private subscriptions: any[]
	public totalSupply: Observable<string>
	public balanceOf: Observable<string>
	public allowance: Observable<string>
	public name: Observable<string>
	public symbol: Observable<string>
	public decimals: Observable<string>

	constructor() {
		this.subscriptions = Array(6);

	}

	async create(web3: Web3, weiDaiInstance: WeiDai, currentAccount: string) {
		let index = 0;
		this.subscriptions[index] = web3.eth.subscribe("newBlockHeaders")

		let prevTotalSupply: string = ""
		this.totalSupply = await LockSubscription(this.subscriptions[index++], async (observer) => {
			const result = await weiDaiInstance.totalSupply().call({ from: currentAccount })
			if (prevTotalSupply != result) {
				observer.next(result)
				prevTotalSupply = result;
			}
		})

		let prevBalance: string = ""
		this.balanceOf = await LockSubscription(this.subscriptions[index++], async (observer) => {
			const result = await weiDaiInstance.balanceOf(currentAccount).call({ from: currentAccount })
			if (prevBalance != result) {
				observer.next(result)
				prevBalance = result;
			}
		})
		//continue here for each method
	}


	unsubscribe() {
		this.subscriptions.forEach(sub => {
			if (sub)
				sub.unsubscribe()
		})
	}
}
