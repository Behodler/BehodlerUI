import { Multicall, ContractCallResults, ContractCallContext } from 'ethereum-multicall'
import API from '../../../../blockchain/ethereumAPI'

import ABIs from '../../../../blockchain/ABIs.json'

interface contract {
    address: string
    name: string
}
export default async function FetchBalances(account, contracts: contract[]): Promise<ContractCallResults> {

    const abi = ABIs.ERC20

    const multicall = new Multicall({
        web3Instance: API.web3,
        tryAggregate: true,
        multicallCustomContractAddress: API.contractAddresses.Multicall3
    })
    const contractCallContext: ContractCallContext[] = contracts.map((c, i) => ({
        reference: c.name,
        contractAddress: c.address,
        abi,
        calls: [{ reference: 'balanceOfCall', methodName: 'balanceOf', methodParameters: [account] }],
    }))

    return await multicall.call(contractCallContext)
}
