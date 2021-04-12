import Web3 from "web3";
import { SluiceGate } from '../contractInterfaces/liquidQueue/SluiceGate'
import { address } from "../contractInterfaces/SolidityTypes";


import { Effect, FetchNumberFields } from './common'
import EffectBase from './EffectBase'

export class SluiceGateEffects extends EffectBase {

    private sluiceGateInstance: SluiceGate
    private account:address
	constructor(web3: Web3, sluiceGate: SluiceGate, account: string) {
		super(web3, account)
		this.sluiceGateInstance = sluiceGate;
        this.account = account;
	}

    whiteListEffect():Effect {
        return this.createEffect(async ({account}) => {
            const params: FetchNumberFields = {
				web3: this.web3,
				action: async (accounts) => await this.sluiceGateInstance.whitelist(this.account).call({ from: accounts[0] }),
				defaultValue: "unset",
				accounts: [account]
			}
            return await params.action(params.accounts)
        })
    }
}