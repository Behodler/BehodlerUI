import { useCallback } from 'react'

import { TokenListItem } from '../TradingBox3/types';

import { useTradeableTokensList, IGroupedList } from './useTradeableTokensList'

interface TokenConfigAddressMaps {
    addressToPyroTokenV2: (address: string) => TokenListItem
    addressToPyroTokenV3: (address: string) => TokenListItem
    addressToBaseToken: (address: string, location: string) => TokenListItem
}

export function useTokenConfigs(): TokenConfigAddressMaps {
    const groups: IGroupedList = useTradeableTokensList();
    const addressToBaseToken = useCallback((address: string, location: string): TokenListItem => {
        const vals = groups.baseTokens.filter(t => t.address.toLowerCase() === address.toLowerCase())
        if (vals.length !== 0)
            return vals[0]

        throw `addressToBaseToken location ${location}: could not find <${address}> in ${groups.baseTokens.map(t => t.address.toLowerCase())}`
    }, [groups.baseTokens])

    const addressToPyroTokenV2 = useCallback((address: string): TokenListItem => {
        const value = groups.pyroTokensV2.filter(t => t.address.toLowerCase() === address.toLowerCase())[0]
        return value
    }, [groups.pyroTokensV2])

    const addressToPyroTokenV3 = useCallback((address: string): TokenListItem => {
        const vals = groups.pyroTokensV3.filter(t => t.address.toLowerCase() === address.toLowerCase())
        if (vals.length === 1)
            return vals[0]
        throw `could not find <${address}> with display name in set`
    }, [groups.pyroTokensV3])


    return {
        addressToPyroTokenV2,
        addressToPyroTokenV3,
        addressToBaseToken,
    };
}
