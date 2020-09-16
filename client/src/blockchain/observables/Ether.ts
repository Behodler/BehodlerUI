import Web3 from "web3";
import { Effect, FetchNumberFields, FetchEthereumNumber,FetchNumber } from './common'
import Token from './Token'
import API from '../ethereumAPI'
import { ERC20 } from '../contractInterfaces/ERC20'

export class EtherEffects extends Token {
	tokenInstance: ERC20
	constructor(web3: Web3, tokenInstance: ERC20, account: string) {
		super(web3, account)
		this.tokenInstance = tokenInstance
	}

	balanceOfEffect(holder: string): Effect {
		return this.createEffect(async ({ account, blockNumber }) => {
			const params: FetchNumberFields = {
				web3: this.web3,
				action: async (accounts) => await this.web3.eth.getBalance(accounts[0]),
				defaultValue: "unset",
				accounts: [holder, account]
			}
			return API.fromWei(await params.action(params.accounts))
		})
	}

	balanceOfTokenEffect(holder: string): Effect {
		return this.createEffect(async ({ account, blockNumber }) => {
			const params: FetchNumberFields = {
				web3: this.web3,
				action: async (accounts) => await this.tokenInstance.balanceOf(accounts[0]).call({ from: accounts[1] }),
				defaultValue: "unset",
				accounts: [holder, account]
			}
			return await FetchEthereumNumber(params)
		})
	}

	// allowance(owner: string, spender: string): Effect {
	// 	return this.createEffect(async ({ account, blockNumber }) => {
	// 		const params: FetchNumberFields = {
	// 			web3: this.web3,
	// 			action: async (accounts) => await this.web3.eth.getBalance(accounts[0]),
	// 			defaultValue: "unset",
	// 			accounts: [owner, spender, account]
	// 		}
	// 		return await params.action(params.accounts)
	// 	})
	// }

	allowance(owner: string, spender: string): Effect {
		return this.createEffect(async ({ account, blockNumber }) => {
			const params: FetchNumberFields = {
				web3: this.web3,
				action: async (accounts) => await this.tokenInstance.allowance(accounts[0], accounts[1]).call({ from: accounts[2] }),
				defaultValue: "unset",
				accounts: [owner, spender, account]
			}
			return await FetchNumber(params)
		})
	}

	
	totalSupplyEffect(): Effect {
		return this.createEffect(async ({ account, blockNumber }) => {
			const params: FetchNumberFields = {
				web3: this.web3,
				action: async (accounts) => "100000000",
				defaultValue: "unset",
				accounts: [account]
			}
			return await params.action(params.accounts)
		})
	}
}
