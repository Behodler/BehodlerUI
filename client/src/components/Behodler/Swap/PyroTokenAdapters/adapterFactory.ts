import IContracts from "src/blockchain/IContracts"
import { pv3 } from "./pv3"
import { Target } from "./target"
import { wethProxyV2 } from "./wethProxyV2"
import { wethProxyV3 } from "./wethProxyV3"
import { pv2 } from "./pv2"

const adapterFactory = async (contracts: IContracts, hasV2Balance: boolean, minting: boolean, isEth: boolean, address: string): Promise<Target> => {
    if (minting || !hasV2Balance) {
        if (isEth) {
            return await wethProxyV3(contracts)
        }
        else {
            return await pv3(address)
        }

    } else {
        if (isEth) {
            return await wethProxyV2(minting, contracts)
        } else {
            return await pv2(address)
        }
    }
}

export default adapterFactory