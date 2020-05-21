
import { address, uint } from "../../SolidityTypes"
import { Ownable } from '../../Ownable'
import { BaseContract } from '../../BaseContract'

export interface Sisyphus extends BaseContract, Ownable {
    //props
    enabled: () => any
    rewardProportion: () => any
    CurrentMonarch: () => any
    scarcity: () => any
    BuyoutAmount: () => any
    BuyoutTime: () => any
    periodDuration: () => any
    totalIncrements: () => any
    //functions
    enable: (e: boolean) => any
    setTime: (periodDurationType: uint, totalIncrements: uint) => any
    setRewardProportion: (proportion: uint) => any
    seed: (scx: address) => any
    struggle: (scarcityForwarded: uint) => any
    calculateCurrentBuyout: () => any
}