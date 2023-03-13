import { useMemo } from 'react'

import { TokenListItem } from "../TradingBox3/types";
import tokensConfigByNetwork from "../../../../blockchain/behodlerUI/baseTokens.json";
import { TokenList, ImagePair } from "../TradingBox3/ImageLoader";

import { useWalletContext } from "./useWalletContext";

interface ITokenConfig {
    id: string,
    displayName: string,
    pyroDisplayName: string,
    address: string,
    pyroAddress: string
}
interface ITokenGroup {
    config: ITokenConfig
    baseToken: TokenListItem
    pyroToken: TokenListItem
}
export function useTradeableTokensList() {
    const { networkName } = useWalletContext()

    const daiAddress = useMemo(() => (
        tokensConfigByNetwork[networkName].find(token => token.id === 'dai').address
    ), [networkName])

    const tokenInfo: ITokenGroup[] = useMemo(() => (
        (tokensConfigByNetwork[networkName] as ITokenConfig[])
            .filter(({ id }) => id !== 'dai' && id !== 'scarcity')
            .map((config: ITokenConfig) => {
                const imagePair: ImagePair = TokenList.find(pair => pair.id === config.id)
                    || { id: '', baseToken: { image: '', name: '' }, pyroToken: { image: '', name: '' } }

                const baseToken: TokenListItem = { name: config.displayName, address: config.address, image: imagePair.baseToken.image }
                const pyroToken: TokenListItem = { name: config.pyroDisplayName, address: config.pyroAddress, image: imagePair.pyroToken.image }
                return { config, baseToken, pyroToken }
            })
    ), [networkName])
    const baseTokens = tokenInfo.map(item => item.baseToken)
    const pyroTokens = tokenInfo.map(item => item.pyroToken)
    const allTokensConfig = tokenInfo.map(item => item.config)
    return { baseTokens, pyroTokens, allTokensConfig, daiAddress }
}
