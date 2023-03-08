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
