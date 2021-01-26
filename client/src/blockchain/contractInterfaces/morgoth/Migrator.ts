import { address, uint } from '../SolidityTypes'

export interface Migrator {
    stepCounter: () => any
    bridge: () => any
    initBridge: () => any
    bail: () => any
    step1: () => any
    step2: (tokens: address[]) => any
    step3: () => any
    step4: (iterations: uint) => any
    step5: () => any
    step6: (iterations: uint) => any
    step7: () => any
}