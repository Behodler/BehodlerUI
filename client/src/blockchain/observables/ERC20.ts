import Web3 from "web3";
import { ERC20 } from '../contractInterfaces/ERC20'
import { Effect, FetchNumber, FetchNumberFields } from './common'
import EffectBase from './EffectBase'

export class ERC20Effects extends EffectBase {
	tokenInstance: ERC20

	constructor(web3: Web3, tokenInstance: ERC20) {
		super(web3)
		this.tokenInstance = tokenInstance
	}

	totalSupplyEffect(): Effect {
		return this.createEffect(async (account) => {
			const params: FetchNumberFields = {
				web3: this.web3,
				action: async (accounts) => await this.tokenInstance.totalSupply().call({ from: accounts[0] }),
				defaultValue: "unset",
				accounts: [account]
			}
			return await FetchNumber(params)
		})
	}

	balanceOfEffect(holder: string): Effect {
		return this.createEffect(async (account) => {
			const params: FetchNumberFields = {
				web3: this.web3,
				action: async (accounts) => await this.tokenInstance.balanceOf(accounts[0]).call({ from: accounts[1] }),
				defaultValue: "unset",
				accounts: [holder, account]
			}
			return await FetchNumber(params)
		})
	}

	allowance(owner: string, spender: string): Effect {
		return this.createEffect(async (account) => {
			const params: FetchNumberFields = {
				web3: this.web3,
				action: async (accounts) => await this.tokenInstance.allowance(accounts[0], accounts[1]).call({ from: accounts[2] }),
				defaultValue: "unset",
				accounts: [owner, spender, account]
			}
			return await FetchNumber(params)
		})
	}
}
