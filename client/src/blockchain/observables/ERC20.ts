import Web3 from "web3";
import { ERC20 } from '../contractInterfaces/ERC20'
import { Effect, FetchEthereumNumber, FetchNumberFields, FetchNumber } from './common'
import Token from './Token'
import BigNumber from 'bignumber.js';

export class ERC20Effects extends Token {
	tokenInstance: ERC20
	decimalFactor: BigNumber
	constructor(web3: Web3, tokenInstance: ERC20, account: string, decimalPlaces:number = 18) {
		super(web3, account)
		this.tokenInstance = tokenInstance
		this.decimalFactor = new BigNumber(10).pow(decimalPlaces)
		try {
			tokenInstance.decimals().call({ from: account }).then(d => this.decimalFactor = new BigNumber(10).pow(d)).catch(e => { })
		} catch{ }
	}

	totalSupplyEffect(): Effect {
		return this.createEffect(async ({ account, blockNumber }) => {
			const params: FetchNumberFields = {
				web3: this.web3,
				action: async (accounts) => await this.tokenInstance.totalSupply().call({ from: accounts[0] }),
				defaultValue: "unset",
				accounts: [account]
			}
			return await FetchEthereumNumber(params)
		})
	}

	balanceOfEffect(holder: string): Effect {
		return this.createEffect(async ({ account, blockNumber }) => {
			const params: FetchNumberFields = {
				web3: this.web3,
				action: async (accounts) => new BigNumber(await this.tokenInstance.balanceOf(accounts[0]).call({ from: accounts[1] })).dividedBy(this.decimalFactor).toString(),
				defaultValue: "unset",
				accounts: [holder, account]
			}
			return await params.action(params.accounts)
		})
	}

	balanceOfTokenEffect(holder: string): Effect {
		return this.createEffect(async ({ account, blockNumber }) => {
			const params: FetchNumberFields = {
				web3: this.web3,
				action: async (accounts) => new BigNumber(await this.tokenInstance.balanceOf(accounts[0]).call({ from: accounts[1] })).dividedBy(this.decimalFactor).toString(),
				defaultValue: "unset",
				accounts: [holder, account]
			}
			return await params.action(params.accounts)
		})
	}

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
}
