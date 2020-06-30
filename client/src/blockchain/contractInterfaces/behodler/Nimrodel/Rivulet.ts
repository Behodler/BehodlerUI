import { address, uint } from "../../SolidityTypes";
import { Ownable } from '../../Ownable';
import { BaseContract } from '../../BaseContract';

export interface Rivulet extends BaseContract, Ownable {
    //fields
    celeborn: () => any
    staked: (user: address) => uint
    tickets: (user: address) => uint
    totalTickets: () => uint
    scxMultiple: (staker: address) => uint
    damHeightAtJoin: (staker: address) => uint
    ponds: (staker: address) => uint
    damHeight: () => any
    maxTickets: () => any
    initialDai: () => any
    timeScale: () => any
    burnMultiple: () => any
    ticketSize: () => any
    lastDrip: () => any

    //functions
    seed: (dai: address, scx: address, celeborn: address, time: uint, burnMultiple: uint, maxTickets: uint) => any
    setTicketParameters: (ticketSize: uint, maxTickets: uint) => any
    setBurnMultiple: (b: uint) => any
    celebrant: (value: uint) => any
    dripIfStale: () => any
    drip: () => any
    drainPond: () => any
    stake: (stakeValue: uint, burnValue: uint) => any
    unstake: (scx: uint) => any
    aggregateFlow: () => any
}