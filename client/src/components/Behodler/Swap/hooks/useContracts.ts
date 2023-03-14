import { useCallback , useState} from 'react'

import IContracts, { DefaultContracts } from '../../../../blockchain/IContracts'
import { Weth } from '../../../../blockchain/contractInterfaces/behodler/Weth'
import { Behodler2 } from '../../../../blockchain/contractInterfaces/behodler2/Behodler2'
import { PyroWeth10Proxy } from '../../../../blockchain/contractInterfaces/behodler2/PyroWeth10Proxy'

import { useWalletContext } from './useWalletContext'

export function useContracts(): IContracts {
    try {
        return useWalletContext().contracts;
    } catch (e) {
        console.error('useContracts', e);
        return DefaultContracts;
    }
}

export function usePyroWeth10ProxyContract(): PyroWeth10Proxy {
    return useContracts().behodler.Behodler2.PyroWeth10Proxy
}

export function useBehodlerContract(): Behodler2 {
    return useContracts().behodler.Behodler2.Behodler2
}

export function useWeth10Contract(): Weth {
    return useContracts().behodler.Behodler2.Weth10
}

export function useContractCall(defaultContract?: Object): [Function, boolean, boolean] {
    const [isCalling, setIsCalling] = useState(false)
    const [isError, setIsError] = useState(false)

    const callContractMethod = useCallback(async ({ method, args = [], overrides, contract = defaultContract }) => {
        try {
            setIsCalling(true)
            const callPromise = await contract[method](...args).call(overrides || {});
            setIsCalling(false)
            return callPromise;
        } catch (e) {
            setIsCalling(false)
            setIsError(true)
            const contractName = contract?.constructor?.name || contract?.name || contract;
            console.error('error calling contract', contractName , method, args, e);
        }
    }, [defaultContract])

    return [callContractMethod, isCalling, isError]
}
