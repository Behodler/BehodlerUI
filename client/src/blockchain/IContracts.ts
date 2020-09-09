import { address, uint,Bytes,Bytes32 } from './contractInterfaces/SolidityTypes'
import { Behodler } from './contractInterfaces/behodler/Behodler'
import { Chronos } from './contractInterfaces/behodler/Chronos'
import { Janus } from './contractInterfaces/behodler/Janus'
import { Kharon } from './contractInterfaces/behodler/Kharon'
import { Prometheus } from './contractInterfaces/behodler/Prometheus'
import { Scarcity } from './contractInterfaces/behodler/Scarcity'
import { Weth } from './contractInterfaces/behodler/Weth'
//hephaestus
import { Bellows } from './contractInterfaces/behodler/hephaestus/Bellows'
import { Lachesis } from './contractInterfaces/behodler/hephaestus/Lachesis'
import { PyroToken } from './contractInterfaces/behodler/hephaestus/PyroToken'
import { PyroTokenRegistry } from './contractInterfaces/behodler/hephaestus/PyroTokenRegistry'
//sisyphus
import { Sisyphus } from './contractInterfaces/behodler/Sisyphus/Sisyphus'
import { Faucet } from './contractInterfaces/behodler/Sisyphus/Faucet'

import { Celeborn } from './contractInterfaces/behodler/Nimrodel/Celeborn'
import { Miruvor } from './contractInterfaces/behodler/Nimrodel/Miruvor'
import { Rivulet } from './contractInterfaces/behodler/Nimrodel/Rivulet'


export interface NimrodelContracts {
	Celeborn:Celeborn
	Miruvor:Miruvor
	Rivulet:Rivulet	
}

export interface SisyphusContracts {
	Sisyphus: Sisyphus
	Faucet: Faucet
}

export interface BehodlerContracts {
	Behodler: Behodler,
	Chronos: Chronos,
	Janus: Janus,
	Kharon: Kharon,
	Prometheus: Prometheus,
	Scarcity: Scarcity,
	Weth: Weth,
	Bellows: Bellows,
	Lachesis: Lachesis,
	PyroToken: PyroToken,
	PyroTokenRegistry: PyroTokenRegistry,
	Sisyphus: SisyphusContracts
	Nimrodel:NimrodelContracts
}

export default interface IContracts {
	behodler: BehodlerContracts
}

const defaultBase = {
	address: "0x0"
}

const defaultSecondary = {
	primary: () => { },
	transferPrimary: (recipient: string) => { }
}

const defaultOwnable = {
	owner: () => { },
	transferOwnership: (newOwner: address) => { }
}

const defaultERC20 = {
	totalSupply: () => { },
	balanceOf: (address: address) => { },
	allowance: (owner: address, spender: address) => { },
	transfer: (to: address, value: uint) => { },
	approve: (spender: address, value: uint) => { },
	transferFrom: (from: address, to: address, value: uint) => { },
	increaseAllowance: (spender: address, addedValue: uint) => { },
	decreaseAllowance: (spender: address, subtractedValue: uint) => { },
	decimals: () => { },
	symbol: () => { },
	name: () => { }
}

const defaultBehodler: Behodler = {
	...defaultBase,
	...defaultSecondary,
	seed: (lachesis: address, kharon: address, janus: address, chronos: address) => { },
	calculateAverageScarcityPerToken: (token: address, value: uint) => { },
	tokenScarcityObligations: (token: string) => { },
	buyDryRun: (tokenAddress: address, value: uint, minPrice: uint) => { },
	sellDryRun: (tokenAddress: address, scarcityValue: uint, maxPrice: uint) => { }
}

const defaultChronos: Chronos = {
	...defaultBase,
	...defaultSecondary,
	seed: (behodler: address) => { }
}

const defaultJanus: Janus = {
	...defaultBase,
	...defaultSecondary,
	seed: (scx: address, weth: address, behodler: address) => { },
	tokenToToken: (input: address, output: uint, value: uint, minPrice: uint, maxPrice: uint) => { },
	ethToToken: (output: address, minPrice: uint, maxPrice: uint) => { },
	tokenToEth: (input: address, value: uint, minPrice: uint, maxPrice: uint) => { },
	addLiquidityTokens: (token1: address, token2: address, v1: string, v2: string) => { },
	addLiquidityTokenAndEth: (token: address, v1: string) => { }
}

const defaultKharon: Kharon = {
	...defaultBase,
	...defaultSecondary,
	setTollRate: (toll: uint) => { },
	seed: (bellows: address, behodler: address, prometheus: address, weiDaiBank: address, dai: address, weidai: address, scar: address, cut: uint, donationAddress: address) => { },
	toll: (token: address, value: uint) => { },
	withdrawDonations: (token: address) => { },
	demandPaymentRewardDryRun: (token: address, value: uint) => { }
}

const defaultPrometheus: Prometheus = {
	...defaultBase,
	...defaultSecondary,
	seed: (kharon: address, scarcity: address, weidai: address, dai: address, registry: address) => { },
	stealFlame: (token: address, kharonToll: uint, buyer: address) => { },
}

const defaultScarcity: Scarcity = {
	...defaultSecondary,
	...defaultBase,
	...defaultERC20,
	setBehodler: (behodler: address) => { },
	burn: (value: uint) => { }
}

const defaultWeth: Weth = {
	...defaultBase,
	...defaultSecondary,
	...defaultERC20,
	deposit: () => { },
	withdraw: (value: uint) => { }
}

const defaultBellows: Bellows = {
	...defaultBase,
	...defaultSecondary,
	seed: (lachesisAddress: address, pyroTokenRegistry: address) => { },
	open: (baseToken: address, value: uint) => { },
	blast: (pyroToken: address, value: uint) => { },
	getLastAdjustmentBlockNumber: () => { },
	getRedeemRate: (pyroToken: address) => { }
}

const defaultLachesis: Lachesis = {
	...defaultSecondary,
	...defaultBase,
	setScarcity: (s: address) => { },
	measure: (token: address, valid: boolean) => { },
	cut: (token: address) => { }
}

const defaultPyroToken: PyroToken = {
	...defaultBase,
	...defaultSecondary,
	...defaultERC20,
	engulf: (pyroRecipient: address, value: uint) => { },
	burn: (value: uint) => { }
}

const defaultPyroTokenRegistry: PyroTokenRegistry = {
	...defaultBase,
	...defaultSecondary,
	seed: (bellows: address, lachesis: address, kharon: address) => { },
	addToken: (name: string, symbol: string, baseToken: address) => { },
	baseTokenMapping: (base: address) => { },
	pyroTokenMapping: (pToken: address) => { }
}

const defaultSisyphus: Sisyphus = {
	...defaultBase,
	...defaultOwnable,
	enable: (e: boolean) => { },
	setTime: (periodDurationType: uint, totalIncrements: uint) => { },
	setRewardProportion: (proportion: uint) => { },
	seed: (scx: address) => { },
	struggle: (scarcityForwarded: uint) => { },
	calculateCurrentBuyout: () => { },
	enabled: () => { },
	rewardProportion: () => { },
	currentMonarch: () => { },
	scarcity: () => { },
	buyoutAmount: () => { },
	buyoutTime: () => { },
	periodDuration: () => { },
	totalIncrements: () => { },
	faucet: () => { }
	// sponsorToken: () => { },
	// setSponsorToken: (t: address) => { }
}

const defaultFaucet: Faucet = {
	...defaultOwnable,
	...defaultBase,
	seed: (scx: address) => { },
	calibrate: (dripInterval: uint, drips: uint) => { },
	drip: () => { },
	takeDonation: (value: uint) => { },
	lastRecipient: () => { },
	dripsRemaining: () => { },
	dripSize: () => { },
	lastDrip: () => { },
	dripInterval: () => { },
	scarcity: () => { },
	drips: () => { },
	replaceWasher: () => { },
	lastKnownBalance: () => { }
}

const defaultSisyphusContracts: SisyphusContracts = {
	Sisyphus: defaultSisyphus,
	Faucet: defaultFaucet
}

const defaultCeleborn:Celeborn = {
	...defaultOwnable,
	...defaultBase,
	maxGold: () => {},
    maxSilver: () => {},
    maxBronze: () => {},
    goldThreshold: () => {},
    silverThreshold: () => {},
    bronzeThreshold: () => {},
    safetyDurationMultiplier: () => {},

    //functions
    sponsor: (slot:uint, value:uint, company:Bytes32, logo:Bytes32,siteURL:Bytes32,message:Bytes) => {},
    seed: (rivulet:address, dai:address)=> {},
    setMaxSponsorships: (gold:uint,silver:uint,bronze:uint, multiplier:uint)=>{},
    getSponsorshipData:(slot:uint,field:uint)=>{},
}

const defaultRivulet:Rivulet = {
	...defaultOwnable,
	...defaultBase,
	celeborn: () =>{},
    staked: (user: address) =>"",
    tickets: (user: address) =>"",
    totalTickets: () =>"",
    scxMultiple: (staker: address) =>"",
    damHeightAtJoin: (staker: address) =>"",
    ponds: (staker: address) =>"",
    damHeight: () =>{},
    maxTickets: () =>{},
    initialDai: () =>{},
    timeScale: () =>{},
    burnMultiple: () =>{},
    ticketSize: () =>{},
    lastDrip: () =>{},

    //functions
    seed: (dai: address, scx: address, celeborn: address, time: uint, burnMultiple: uint, maxTickets: uint) =>{},
    setTicketParameters: (ticketSize: uint, maxTickets: uint) =>{},
    setBurnMultiple: (b: uint) =>{},
    celebrant: (value: uint) =>{},
    dripIfStale: () =>{},
    drip: () =>{},
    drainPond: () =>{},
    stake: (stakeValue: uint, burnValue: uint) =>{},
    unstake: (scx: uint) =>{},
    aggregateFlow: () =>{},
}

const defaultMiruvor:Miruvor = {
	...defaultBase,
	...defaultOwnable,
	discount: () =>{},
    SCXperToken: (token: address) =>"",

    //functions
    setMarkup: (markup: uint) =>{},
    seed: (scx: address, behodler: address, lachesis: address, janus: address, weth: address, registry: address, dai: address, weidai: address) =>{},
    canDrink: (token: address) =>{},
    refresh: (token: address) =>{},
    drink: (token: address, value: uint) =>{},
    drinkEth: () =>{},
    stopperEth: () =>{},
    stopper: (token: address) =>{},
    calculateSCXperToken: (token: address, scx: address) =>{},
}

const defaultNimrodel:NimrodelContracts = {
	Celeborn:defaultCeleborn,
	Miruvor:defaultMiruvor,
	Rivulet:defaultRivulet
}

export const DefaultBehodlerContracts: BehodlerContracts = {
	Behodler: defaultBehodler,
	Chronos: defaultChronos,
	Janus: defaultJanus,
	Kharon: defaultKharon,
	Prometheus: defaultPrometheus,
	Scarcity: defaultScarcity,
	Weth: defaultWeth,
	Bellows: defaultBellows,
	Lachesis: defaultLachesis,
	PyroToken: defaultPyroToken,
	PyroTokenRegistry: defaultPyroTokenRegistry,
	Sisyphus: defaultSisyphusContracts,
	Nimrodel:defaultNimrodel
}

export const DefaultContracts: IContracts = {
	behodler: DefaultBehodlerContracts
}