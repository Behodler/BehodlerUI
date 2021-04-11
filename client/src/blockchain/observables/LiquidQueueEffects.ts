import Web3 from "web3";
import { ERC20 } from "../contractInterfaces/ERC20";
import { LiquidQueue } from '../contractInterfaces/liquidQueue/LiquidQueue'
import UniswapV2Factory from '../contractInterfaces/liquidQueue/UniswapV2Factory'
import { address } from "../contractInterfaces/SolidityTypes";
import { MintingModule } from '../contractInterfaces/liquidQueue/MintingModule'
import { Effect, FetchEthereumNumber, FetchNumberFields } from './common'
import EffectBase from './EffectBase'
import ERC20JSON from "../behodlerUI/ERC20.json"
import BigNumber from "bignumber.js";
import API from "../ethereumAPI";

export interface LiquidQueueBatch {
    recipient: string,
    LP: string,
    amount: string,
    joinTimeStamp: string,
    durationSinceLast: string,
    eyeHeightAtJoin: string
}

export class LiquidQueueEffects extends EffectBase {

    private liquidQueueInstance: LiquidQueue
    private mintingModuleInstance: MintingModule
    private rewardContractAddress: string
    private account: address
    // private EYE: ERC20
    // private SCX: ERC20
    private factory: UniswapV2Factory;

    constructor(web3: Web3,
        liquidQueueInstance: LiquidQueue,
        mintingModule: MintingModule,
        rewardContractAddress: string,
        account: string,
        eye: ERC20,
        scx: ERC20,
        factory: UniswapV2Factory) {
        super(web3, account)
        this.liquidQueueInstance = liquidQueueInstance;
        this.account = account;
        this.mintingModuleInstance = mintingModule
        this.rewardContractAddress = rewardContractAddress
        //this.EYE = eye
        this.factory = factory
        // this.SCX = scx
    }

    queueDataEffect(): Effect {
        return this.createEffect(async ({ account }) => {
            const params: FetchNumberFields = {
                web3: this.web3,
                action: async (accounts) => await this.liquidQueueInstance.getQueueData().call({ from: this.account }),
                defaultValue: "unset",
                accounts: [account]
            }
            return await params.action(params.accounts)
        })
    }

    //TODO: reward must take iron crown into account
    maxInputTokenGivenReward(inputInstance: ERC20, outputInstance: ERC20): Effect {
        const action = async (accounts: string[]) => {
            const ONE = BigInt('1000000000000000000')


            const pairAddress = await this.factory.getPair(inputInstance.address, outputInstance.address).call()
            const inputReserve = BigInt((await inputInstance.balanceOf(pairAddress).call()).toString())
            const outputReserve = BigInt((await outputInstance.balanceOf(pairAddress).call()).toString())
            const rewardValue = BigInt((await outputInstance.balanceOf(this.rewardContractAddress).call()).toString())

            let maximumInput = (((rewardValue * (inputReserve * ONE)) / (outputReserve))) / ONE

            const tiltedToken = await this.mintingModuleInstance.inputTokenTilting(inputInstance.address).call()
            if (tiltedToken === outputInstance.address) {//input must be adjusted downwards by tilt adjustment
                const hundred = BigInt(100)
                const tiltPercentage = BigInt((await this.mintingModuleInstance.tiltPercentage().call()).toString())
                const tiltAdjustment = hundred + tiltPercentage
                maximumInput = ((maximumInput * ONE * hundred) / tiltAdjustment) / ONE
            }

            return maximumInput.toString()
        }
        return this.createEffect(async ({ account }) => {
            const params: FetchNumberFields = {
                web3: this.web3,
                action,
                defaultValue: "unset",
                accounts: [account]
            }
            return await FetchEthereumNumber(params)
        })
    }


    pendingEye(): Effect {
        const action = async (accounts: string[]) => {
            const queueData = await this.liquidQueueInstance.getQueueData().call()
            const qLength = parseInt(queueData[0].toString())
            let totalEye = BigInt(0);
            let currentEyeHeight = BigInt(queueData.eyeHeight.toString())
            for (let i = 0; i < qLength; i++) {
                const batchData = await this.liquidQueueInstance.getBatch(i).call()
                let eyeHeight = BigInt(batchData[5].toString())
                if (eyeHeight < currentEyeHeight) {
                    totalEye += currentEyeHeight - eyeHeight
                }
            }
            return totalEye.toString()
        }

        return this.createEffect(async ({ account }) => {
            const params: FetchNumberFields = {
                web3: this.web3,
                action,
                defaultValue: "unset",
                accounts: [account]
            }
            return await params.action(params.accounts)
        })
    }


    latestPositionInQueue(currentUser: address): Effect {
        const action = async (accounts: string[]) => {
            const queueData = await this.liquidQueueInstance.getQueueData().call()
            const qLength = parseInt(queueData[0].toString())
          
            for (let i = 0; i < qLength; i++) {
                const batchData = await this.liquidQueueInstance.getBatch(i).call()
                let recipient = batchData[0];

                if (recipient.toLowerCase() === currentUser.toLowerCase())
                    return i;
            }
            return -1
        }
        return this.createEffect(async ({ account }) => {
            const params: FetchNumberFields = {
                web3: this.web3,
                action,
                defaultValue: "unset",
                accounts: [account]
            }
            return await params.action(params.accounts)
        })
    }

    lpBalance(token: address, holder: string): Effect {
        BigNumber.set({ EXPONENTIAL_AT: 18 });
        const action = async (accounts: string[]) => {
            const outputToken = await this.mintingModuleInstance.inputOutputToken(token).call()
            const pair = await this.factory.getPair(token, outputToken).call()
            const lpToken: ERC20 = new this.web3.eth.Contract(ERC20JSON.abi as any, pair).methods
            lpToken.address = pair
            return (await lpToken.balanceOf(holder).call()).toString()
        }

        return this.createEffect(async ({ account, blockNumber }) => {
            const params: FetchNumberFields = {
                web3: this.web3,
                action,
                defaultValue: "unset",
                accounts: [holder, account]
            }
            return API.fromWei(await params.action(params.accounts))
        })
    }
}
