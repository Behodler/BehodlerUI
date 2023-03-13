import flat from "./FlatEcosystemAddresses.json"

export interface IFlatEcosystemAddress {
    Weth: string,
    AddressBalanceCheck: string,
    Behodler: string,
    UniswapV2Factory: string,
    UniswapV2Router: string,
    SushiswapV2Factory: string,
    SushiswapV2Router: string,
    EYE: string,
    MKR: string,
    OXT: string,
    PNK: string,
    LNK: string,
    LOOM: string,
    DAI: string,
    WEIDAI: string,
    EYE_DAI: string,
    SCX_ETH: string,
    SCX_EYE: string,
    Lachesis: string,
    LiquidityReceiverV1: string,
    PyroWeth10Proxy: string,
    Multicall: string,
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
    Aave: string,
    Curve: string,
    Convex: string,
    MIM: string,
    Uni: string,
    Sushi: string,
    WBTC: string,
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

export const FlatEcosystemAddresses = flat as IFlatEcosystemAddress

