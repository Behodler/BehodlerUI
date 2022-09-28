import { Multicall, ContractCallResults, ContractCallContext } from 'ethereum-multicall'
import API from '../../../../blockchain/ethereumAPI'
import ERC20JSON from '../../../../blockchain/behodlerUI/ERC20.json'
import addresses from '../../../../blockchain/behodler2UI/Addresses.json'

interface contract {
    address: string
    name: string
}
export default async function FetchBalances(account, contracts: contract[], networkName: String): Promise<ContractCallResults> {
    const abi = ERC20JSON.abi
    const multicall = new Multicall({
        web3Instance: API.web3,
        tryAggregate: true,
        multicallCustomContractAddress: networkName === 'private'
            ? addresses.development.multicall2
            : undefined,
    })
    const contractCallContext: ContractCallContext[] = contracts.map((c, i) => ({
        reference: c.name,
        contractAddress: c.address,
        abi,
        calls: [{ reference: 'balanceOfCall', methodName: 'balanceOf', methodParameters: [account] }],
    }))

    return await multicall.call(contractCallContext)
}
