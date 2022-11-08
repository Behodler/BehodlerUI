import API from "../../../../blockchain/ethereumAPI";
import {TokenListItem} from "../TradingBox3/types";
import tokensConfigByNetwork from "../../../../blockchain/behodlerUI/baseTokens.json";
import {TokenList} from "../TradingBox3/ImageLoader";

import useActiveWeb3React from "./useActiveWeb3React";

export function useTradeableTokensList() {
    const { chainId } = useActiveWeb3React()
    const networkName = API.networkMapping[(chainId || 0).toString()]

    const baseTokens: TokenListItem[] = []
    const pyroTokens: TokenListItem[] = []

    if (!networkName) {
        return { baseTokens, pyroTokens, daiAddress: '' }
    }

    const allTokensConfig = tokensConfigByNetwork[networkName];

    const daiAddress = allTokensConfig.find(token => token.id === 'dai').address

    allTokensConfig
        .filter(({ id }) => id !== 'dai' && id !== 'scarcity')
        .forEach(({ id, address, displayName, pyroDisplayName, pyroAddress }) => {
            const imagePair = TokenList.find(pair => pair.id === id)
                || { baseToken: { image: '' }, pyroToken: { image: '' } }

            baseTokens
                .push({ name: displayName, address: address, image: imagePair.baseToken.image })
            pyroTokens
                .push({ name: pyroDisplayName, address: pyroAddress, image: imagePair.pyroToken.image })
        })

    return { baseTokens, pyroTokens, daiAddress, allTokensConfig }
}
