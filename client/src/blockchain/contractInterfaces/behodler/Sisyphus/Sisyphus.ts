
import { address, uint } from "../../SolidityTypes"
import { Ownable } from '../../Ownable'
import { BaseContract } from '../../BaseContract'

export interface Sisyphus extends BaseContract, Ownable {
    //props
    enabled: () => any
    rewardProportion: () => any
    currentMonarch: () => any
    scarcity: () => any
    buyoutAmount: () => any
    buyoutTime: () => any
    periodDuration: () => any
    totalIncrements: () => any
    faucet: () => any
    //functions
    enable: (e: boolean) => any
    setTime: (periodDurationType: uint, totalIncrements: uint) => any
    setRewardProportion: (proportion: uint) => any
    seed: (scx: address, faucet: address) => any
    struggle: (scarcityForwarded: uint) => any
    calculateCurrentBuyout: () => any
    // sponsorToken: () => any
    // setSponsorToken: (t: address) => any
}