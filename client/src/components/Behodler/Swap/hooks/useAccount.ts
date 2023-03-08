import { useActiveWeb3React } from './useActiveWeb3React'

export function useActiveAccountAddress(): string {
    const { account } = useActiveWeb3React()
    return account || '0x0'
}
