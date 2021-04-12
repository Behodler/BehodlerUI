
import { address } from '../SolidityTypes'
import {BaseContract} from '../BaseContract'
export default interface UniswapV2Factory extends BaseContract {
    getPair:(token1:address,token2:address)=>any
}