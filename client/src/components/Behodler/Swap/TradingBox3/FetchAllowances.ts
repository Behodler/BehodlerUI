import { Multicall, ContractCallResults, ContractCallContext } from 'ethereum-multicall'
import API from '../../../../blockchain/ethereumAPI'

import ABIs from '../../../../blockchain/ABIs.json'
//({ base: r.base.address, pV2: r.PV2.address,pv3:r.PV3.address }))
interface mapping {
    name: string
    holdingToken: string
    takingToken: string
}
export default async function FetchAllowances(account: string, addresses: mapping[]): Promise<ContractCallResults> {
    var abi = ABIs.ERC20


    const multicall = new Multicall({
        web3Instance: API.web3,
        tryAggregate: true,
        multicallCustomContractAddress: API.contractAddresses.Multicall3
    })

    //   allowance: (owner: string, spender: string) => Promise<bigint>;

    const contractCallContext: ContractCallContext[] = addresses.map((c, i) => ({
        reference: c.name,
        contractAddress: c.holdingToken,
        abi,
        calls: [{ reference: 'approvedCall', methodName: 'allowance', methodParameters: [account, c.takingToken] }],
    }))

    return await multicall.call(contractCallContext)

}