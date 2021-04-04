import Web3 from "web3";
import { LiquidQueue } from '../contractInterfaces/liquidQueue/LiquidQueue'
import { address } from "../contractInterfaces/SolidityTypes";


import { Effect, FetchNumberFields } from './common'
import EffectBase from './EffectBase'

export class LiquidQueueEffects extends EffectBase {

    private liquidQueueInstance: LiquidQueue
    private account:address
	constructor(web3: Web3, liquidQueueInstance: LiquidQueue, account: string) {
		super(web3, account)
		this.liquidQueueInstance = liquidQueueInstance;
        this.account = account;
	}

    /*
            uint256 length,
            uint256 last,
            uint256 entryIndex,
            uint256 velocity,
            uint256 burnRatio
    */
    queueDataEffect():Effect{
        return this.createEffect(async ({account}) => {
            const params: FetchNumberFields = {
				web3: this.web3,
				action: async (accounts) => await this.liquidQueueInstance.getQueueData().call({ from: this.account }),
				defaultValue: "unset",
				accounts: [account]
			}
            return await params.action(params.accounts)
        })
    }
}