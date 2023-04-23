import flat from "./FlatEcosystemAddresses.json"
import publicTokenConfigs from './TokenConfigs.json'

export interface ITokenConfig {
    displayName: string,
    pyroDisplayName: string,
    address: string,
    pyroV2Address: string
    pyroV3Address: string
}

export interface TokensByNetwork {
    network: string,
    tokens: ITokenConfig[]
}


export interface IFlatEcosystemAddress {
    Weth: string,
    AddressBalanceCheck: string,
    Behodler: string,
    UniswapV2Factory: string
    UniswapV2Router: string,
    SushiswapV2Factory: string,
    SushiswapV2Router: string,
    Lachesis: string,
    LiquidityReceiverV1: string,
    PyroWeth10Proxy: string,
    Multicall3: string,
    PowersRegistry: string,
    Angband: string,
    BigConstants: string,
    LiquidityReceiver: string,
    SeedBehodlerPower: string,
    ConfigureScarcityPower: string,
    PyroWethProxy: string,
    ProxyHandler: string,
    V2Migrator: string,
    LimboDAO: string,
    ToggleWhitelistProposalProposal: string,
    AddressToString: string,
    ProxyDeployer: string,
    MorgothTokenApprover: string,
    TokenProxyRegistry: string,
    SoulReader: string,
    FlashGovernanceArbiter: string,
    Flan: string,
    Limbo: string,
    CrossingLib: string,
    MigrationLib: string,
    SoulLib: string,
    DeployerSnufferCap: string,
    FLN_SCX: string,
    SCX__FLN_SCX: string,
    DAI_SCX: string,
    UniswapHelper: string,
    LimboOracle: string,
    LimboAddTokenToBehodler: string,
    UpdateMultipleSoulConfigProposal: string,
    ProposalFactory: string,
    //For now, LimboTokens are not explicitly included
    // Aave: string,
    // Curve: string,
    // Convex: string,
    // MIM: string,
    // Uni: string,
    // Sushi: string,
    // WBTC: string,
    ConfigureTokenApproverPower: string,
    AdjustFlanFeeOnTransferProposal: string,
    ApproveFlanMintingProposal: string,
    BurnFlashStakeDeposit: string,
    ConfigureFlashGovernanceProposal: string,
    SetAssetApprovalProposal: string,
    SetFateSpendersProposal: string,
    ToggleFlashGovernanceProposal: string,
    UpdateProposalConfigProposal: string
}



const networks = {
    1: "mainnet",
    5: "goerli",
    10: "optimism",
    42: "kovan",
    137: "polygon",
    1337: "private",
    42161: "arbitrum one",
    11155111: "sepolia"
}

class NetworkMapper {
    private error: 'NETWORK_NOT_SUPPORTED'
    public getChainIdFromName(name: string): number {
        const matches = Object.keys(networks).filter(key => networks[key] === name)
        if (matches.length !== 1)
            throw this.error
        return parseInt(matches[0])
    }

    getNameFromChainId(chainId: number): string {
        const keyFound = Object.keys(networks).filter(key => parseInt(key) === chainId).length === 1
        if (!keyFound)
            throw this.error
        return networks[chainId]
    }
}

export const networkMapper = new NetworkMapper()

interface DevServerResult {
    message: string,
    contracts: any
}

export const fetchNetworkAddresses = async (network: string): Promise<IFlatEcosystemAddress> => {
    let addresses: IFlatEcosystemAddress = {} as IFlatEcosystemAddress
    if (networkMapper.getChainIdFromName(network) === 1337) {
        const response = await fetch("http://localhost:1024/get-deployment-addresses", { mode: 'cors', method: 'GET', credentials: "omit", cache: "no-cache" })
        const json = await response.json()
        const serverResult = json as DevServerResult
        if (serverResult.message == 'deployment addresses fetched') {
            addresses = serverResult.contracts
        }
        else
            throw 'dev server error ' + serverResult.message
    } else {
        addresses = flat[network] as IFlatEcosystemAddress

    }
    return addresses
}

export const fetchTokenConfigs = async (network: string): Promise<ITokenConfig[]> => {
    let tokenConfigs: ITokenConfig[] = []
    if (networkMapper.getChainIdFromName(network) === 1337) {
        const response = await fetch("http://localhost:1024/get-token-configs", { mode: 'cors', method: 'GET', credentials: "omit", cache: "no-cache" })
        const json: DevServerResult = await response.json()
        if (json.message === 'tokens found') {
            tokenConfigs = json.contracts as ITokenConfig[]
        }
        else throw 'fetch token config error ' + json.message
    } else {
        tokenConfigs = publicTokenConfigs[network].tokens as ITokenConfig[]
    }
    return tokenConfigs
}