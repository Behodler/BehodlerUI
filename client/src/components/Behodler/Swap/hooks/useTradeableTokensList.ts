import { useMemo } from 'react'

import { TokenListItem } from "../TradingBox3/types";
import ethereumAPI from '../../../../blockchain/ethereumAPI'
import { TokenList, ImagePair } from "../TradingBox3/ImageLoader";

import { useWalletContext } from "./useWalletContext";
import { ITokenConfig } from 'src/blockchain/AllEcosystemAddress';

interface ITokenGroup {
    config: ITokenConfig
    baseToken: TokenListItem
    pyroTokenV2: TokenListItem
    pyroTokenV3: TokenListItem
}

export interface IGroupedList {
    baseTokens: TokenListItem[]
    pyroTokensV2: TokenListItem[]
    pyroTokensV3: TokenListItem[]
    allTokensConfig: ITokenConfig[]
    daiAddress?: string
}
export function useTradeableTokensList(): IGroupedList {
    const { networkName } = useWalletContext()

    const daiAddress = useMemo(() => (
        ethereumAPI.tokenConfigs.find(({ displayName }) => displayName.toLowerCase() === 'dai')?.address
    ), [networkName])

    const tokenInfo: ITokenGroup[] = useMemo(() => (
        ethereumAPI.tokenConfigs
            .filter(({ displayName }) => !['dai', 'eye', 'scarcity', 'weidai'].includes(displayName.toLocaleLowerCase()))
            .map((config: ITokenConfig) => {
                let configId = config.displayName.toLowerCase()
                configId = configId == "weth" ? "eth" : configId
                const imagePair: ImagePair = TokenList.find(pair => pair.baseToken.name.toLowerCase() === configId)
                    || { baseToken: { image: '', name: '' }, pyroToken: { image: '', name: '' } }

                const baseToken: TokenListItem = { name: config.displayName, address: config.address, image: imagePair.baseToken.image }
                const pyroTokenV2: TokenListItem = { name: config.pyroDisplayName + " (V2)", address: config.pyroV2Address, image: imagePair.pyroToken.image }
                const pyroTokenV3: TokenListItem = { name: config.pyroDisplayName + " (V3)", address: config.pyroV3Address, image: imagePair.pyroToken.image }

                return { config, baseToken, pyroTokenV2, pyroTokenV3 }
            })
    ), [networkName])
    const baseTokens = tokenInfo.map(item => item.baseToken)
    const pyroTokensV2 = tokenInfo.map(item => item.pyroTokenV2)
    const pyroTokensV3 = tokenInfo.map(item => item.pyroTokenV3)
    const allTokensConfig = tokenInfo.map(item => item.config)
    return { baseTokens, pyroTokensV2, pyroTokensV3, allTokensConfig, daiAddress }
}
