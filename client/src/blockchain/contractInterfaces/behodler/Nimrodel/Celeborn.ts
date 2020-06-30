import { address, Bytes, Bytes32,uint } from "../../SolidityTypes";
import { Ownable } from '../../Ownable';
import { BaseContract } from '../../BaseContract';

export interface Celeborn extends BaseContract, Ownable {
    //fields
    maxGold: () => any
    maxSilver: () => any
    maxBronze: () => any
    goldThreshold: () => any
    silverThreshold: () => any
    bronzeThreshold: () => any
    safetyDurationMultiplier: () => any

    //functions
    sponsor: (slot:uint, value:uint, company:Bytes32, logo:Bytes32,siteURL:Bytes32,message:Bytes) => any
    seed: (rivulet:address, dai:address)=> any
    setMaxSponsorships: (gold:uint,silver:uint,bronze:uint, multiplier:uint)=>any
    getSponsorshipData:(slot:uint,field:uint)=>any
}