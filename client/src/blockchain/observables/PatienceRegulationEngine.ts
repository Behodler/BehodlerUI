import Web3 from "web3";
import { PatienceRegulationEngine } from '../contractInterfaces/PatienceRegulationEngine'
import { Effect, FetchNumber, FetchEthereumNumber, FetchNumberFields } from './common'
import EffectBase from './EffectBase'

export class PatienceRegulationEffects extends EffectBase {
	preInstance: PatienceRegulationEngine

	constructor(web3: Web3, instance: PatienceRegulationEngine, account: string) {
		super(web3, account)
		this.preInstance = instance
	}

	incubatingWeiDai(holder: string): Effect {
		return this.createEffect(async ({ account, blockNumber }) => {
			const params: FetchNumberFields = {
				web3: this.web3,
				defaultValue: "unset",
				action: async (accounts) => await this.preInstance.getLockedWeiDai(accounts[0]).call({ from: accounts[1] }),
				accounts: [holder, account]
			}
			return await FetchEthereumNumber(params)
		})
	}

	currentPenalty(): Effect {
		return this.createEffect(async ({ account, blockNumber }) => {
			const params: FetchNumberFields = {
				web3: this.web3,
				defaultValue: "unset",
				action: async (accounts) => await this.preInstance.getCurrentPenalty().call({ from: accounts[0] }),
				accounts: [account]
			}
			return await FetchNumber(params)
		})
	}

	calculateCurrentPenaltyForHolder(holder: string): Effect {
		return this.createEffect(async ({ account, blockNumber }) => {
			const params: FetchNumberFields = {
				web3: this.web3,
				defaultValue: "0",
				action: async (accounts) => await this.preInstance.calculateCurrentPenalty(accounts[0], `${blockNumber}`).call({ from: accounts[1] }),
				accounts: [holder, account]
			}
			return await FetchNumber(params)
		})
	}

	lastAdjustmentBlock(): Effect {
		return this.createEffect(async ({ account, blockNumber }) => {
			const params: FetchNumberFields = {
				web3: this.web3,
				defaultValue: "unset",
				action: async (accounts) => await this.preInstance.getLastAdjustmentBlockNumber().call({ from: accounts[0] }),
				accounts: [account]
			}
			return await FetchNumber(params)
		})
	}

	getBlockOfPurchase(): Effect {
		return this.createEffect(async ({ account, blockNumber }) => {
			const params: FetchNumberFields = {
				web3: this.web3,
				defaultValue: "unset",
				action: async (accounts) => await this.preInstance.getBlockOfPurchase().call({ from: accounts[0] }),
				accounts: [account]
			}
			const blockOfPurchase = parseInt(await FetchNumber(params))
			return { blockOfPurchase, blockNumber }
		})
	}

	getClaimWaitWindow(): Effect {
		return this.createEffect(async ({ account, blockNumber }) => {
			const params: FetchNumberFields = {
				web3: this.web3,
				defaultValue: "unset",
				action: async (accounts) => await this.preInstance.getClaimWaitWindow().call({ from: accounts[0] }),
				accounts: [account]
			}
			return await FetchNumber(params)
		})
	}

	getPenaltyDrawdownPeriodForHolder(holder: string): Effect {
		return this.createEffect(async ({ account, blockNumber }) => {
			const params: FetchNumberFields = {
				web3: this.web3,
				defaultValue: "unset",
				action: async (accounts) => await this.preInstance.getPenaltyDrawdownPeriodForHolder(accounts[0]).call({ from: accounts[1] }),
				accounts: [holder, account]
			}
			return await FetchNumber(params)
		})
	}
}