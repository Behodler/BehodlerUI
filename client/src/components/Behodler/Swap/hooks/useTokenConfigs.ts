import { useCallback } from 'react'

import { TokenListItem } from '../TradingBox3/types';

import { useTradeableTokensList } from './useTradeableTokensList'

export function useTokenConfigs() {
    const { pyroTokens, baseTokens } = useTradeableTokensList();

    const addressToBaseToken = useCallback((address: string): TokenListItem => (
        baseTokens.filter(t => t.address.toLowerCase() === address.toLowerCase())[0]
    ), [baseTokens])

    const addressToPyroToken = useCallback((address: string): TokenListItem => (
        pyroTokens.filter(t => t.address.toLowerCase() === address.toLowerCase())[0]
    ), [baseTokens])

    return {
        addressToPyroToken,
        addressToBaseToken,
    };
}
