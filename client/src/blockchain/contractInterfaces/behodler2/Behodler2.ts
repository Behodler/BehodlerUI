import { uint, address } from '../SolidityTypes'
import {ERC20} from '../ERC20'

export interface Behodler2 extends ERC20 {
    //SCARCITY PROPS
    migrator: () => any
    configureScarcity:(transferFee:uint, burnFee:uint) => any
    getConfiguration: () => any
    setMigrator: (m:address)=>any
    burn: (value: uint)=> any

    //BEHODLER PROPS
    setSafetParameters: (swapPrecisionFactor: uint, maxLiquidityExit:uint)=>any
    tokenBurnable:(token:address)=>any
    validTokens:(token:address)=>any
    swap: (inputToken:address,outputToken:address, inputAmount:uint, outputAmount:uint) => any
    addLiquidity: (inputToken:address, amount:uint)=>any
    withdrawLiquidity:(outputToken:address, tokensToRelease:uint) => any
    grantFlashLoan:(amount: uint, flashLoanContract:address) => any
}