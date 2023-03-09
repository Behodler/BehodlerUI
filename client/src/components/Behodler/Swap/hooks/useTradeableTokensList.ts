import { useMemo } from 'react'

import {TokenListItem} from "../TradingBox3/types";
import tokensConfigByNetwork from "../../../../blockchain/behodlerUI/baseTokens.json";
import {TokenList} from "../TradingBox3/ImageLoader";

import { useWalletContext } from "./useWalletContext";

export function useTradeableTokensList() {
    const { networkName } = useWalletContext()

    const baseTokens: TokenListItem[] = []
    const pyroTokens: TokenListItem[] = []

    if (!networkName) {
        return { baseTokens, pyroTokens, daiAddress: '' }
    }

    const daiAddress = useMemo(() => (
        tokensConfigByNetwork[networkName].find(token => token.id === 'dai').address
    ), [networkName])

    const allTokensConfig = useMemo(() => (
        tokensConfigByNetwork[networkName]
            .filter(({ id }) => id !== 'dai' && id !== 'scarcity')
            .forEach(({ id, address, displayName, pyroDisplayName, pyroAddress }) => {
                const imagePair = TokenList.find(pair => pair.id === id)
                    || { baseToken: { image: '' }, pyroToken: { image: '' } }

                baseTokens
                    .push({ name: displayName, address: address, image: imagePair.baseToken.image })
                pyroTokens
                    .push({ name: pyroDisplayName, address: pyroAddress, image: imagePair.pyroToken.image })
            })
    ), [networkName])

    return { baseTokens, pyroTokens, daiAddress, allTokensConfig }
}
