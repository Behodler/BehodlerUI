import { Multicall, ContractCallResults, ContractCallContext } from 'ethereum-multicall'
import API from '../../../blockchain/ethereumAPI'
import ERC20JSON from '../../../blockchain/behodlerUI/ERC20.json'

interface contract {
    address: string
    name: string
}
export default async function FetchBalances(account, contracts: contract[]): Promise<ContractCallResults> {
    const abi = ERC20JSON.abi
    const multicall = new Multicall({ web3Instance: API.web3, tryAggregate: true })
    const contractCallContext: ContractCallContext[] = contracts.map((c, i) => ({
        reference: c.name,
        contractAddress: c.address,
        abi,
        calls: [{ reference: 'balanceOfCall', methodName: 'balanceOf', methodParameters: [account] }],
    }))

    return await multicall.call(contractCallContext)
}
