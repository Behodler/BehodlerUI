import Web3 from "web3";
import { Effect, FetchNumberFields } from './common'
import Token from './Token'
import API from '../ethereumAPI'

export class EtherEffects extends Token {
	constructor(web3: Web3, account: string) {
		super(web3, account)
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

	allowance(owner: string, spender: string): Effect {
		return this.createEffect(async ({ account, blockNumber }) => {
			const params: FetchNumberFields = {
				web3: this.web3,
				action: async (accounts) => await this.web3.eth.getBalance(accounts[0]),
				defaultValue: "unset",
				accounts: [owner, spender, account]
			}
			return await params.action(params.accounts)
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
