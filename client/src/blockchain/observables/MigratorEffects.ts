import Web3 from "web3";
import Migrator from '../contractInterfaces/morgoth/Migrator'
import { Effect, FetchNumber, FetchNumberFields } from './common'
import EffectBase from './EffectBase'
import bridgeJSON from '../../blockchain/behodler2UI/Morgoth/ScarcityBridge.json'

export class MigrationEffects extends EffectBase {
	miratorInstance: Migrator

	constructor(web3: Web3, instance: Migrator, account: string) {
		super(web3, account)
		this.miratorInstance = instance
	}

	exchangeRate(): Effect {
		return this.createEffect(async ({ account, blockNumber }) => {
			const params: FetchNumberFields = {
				web3: this.web3,
				defaultValue: "0",
				action: async (accounts) => {
					const bridgeAddress = await this.miratorInstance.bridge.call({ from: accounts[0] })
					const bridgeContract = await new this.web3.eth.Contract(bridgeJSON.abi as any, bridgeAddress)
					return await bridgeContract.methods.exchangeRate().call()
				},
				accounts: [account]
			}
			return await FetchNumber(params)
		})
	}
}