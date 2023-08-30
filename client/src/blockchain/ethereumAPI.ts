import Web3 from 'web3'
import { Observable } from 'rxjs'
import BigNumber from 'bignumber.js'

import IContracts, { BehodlerContracts, defaultBehodler2, Behodler2Contracts } from './IContracts'
import { ERC20 } from './contractInterfaces/ERC20'
import { PyrotokenV2 } from './contractInterfaces/behodler2/PyrotokenV2'
import { Weth } from './contractInterfaces/behodler/Weth'
import { ERC20Effects } from './observables/ERC20'
import { EtherEffects } from './observables/Ether'
import Token from './observables/Token'

import { Behodler2 } from './contractInterfaces/behodler2/Behodler2'
import { Lachesis as Lachesis2 } from './contractInterfaces/behodler2/Lachesis'
import { LiquidityReceiverV2 } from './contractInterfaces/behodler2/LiquidityReceiverV2'
import { LiquidityReceiverV3 } from './contractInterfaces/behodler2/LiquidityReceiverV3'

import { PyroWeth10Proxy } from './contractInterfaces/behodler2/PyroWeth10Proxy'
import { TokenProxyRegistry } from "./contractInterfaces/limbo/TokenProxyRegistry";
import { V2Migrator } from "./contractInterfaces/pyrotokens/V2Migrator";
import ABIs from "./ABIs.json"
import { IFlatEcosystemAddress, ITokenConfig, fetchNetworkAddresses, fetchTokenConfigs, networkMapper } from './AllEcosystemAddress'
import { PyroWethProxy } from './contractInterfaces/behodler2/PyroWethProxy'
import { PyroTokenV3 } from './contractInterfaces/behodler2/PyroTokenV3'
interface newContracts {
    weiDai: string
    weiDaiBank: string
    PRE: string
}

class ethereumAPI {
    private newContracts: newContracts = { weiDai: '', weiDaiBank: '', PRE: '' }

    public initialized: boolean =false
    public newContractObservable: Observable<newContracts>
    public contractsAvailable: string[]
    public web3: Web3
    public UINTMAX: string = '115792089237316000000000000000000000000000000000000000000000000000000000000000'
    public ONE = BigInt('1000000000000000000')
    public contractAddresses: IFlatEcosystemAddress
    public tokenConfigs: ITokenConfig[]

    constructor() {

        this.contractsAvailable = ['main', 'sepolia']
    }

    public async initialize(chainId: number, currentAccount: string): Promise<IContracts> {
        const networkName = networkMapper.getNameFromChainId(chainId)
        this.contractAddresses = await fetchNetworkAddresses(networkName)
        this.tokenConfigs = await fetchTokenConfigs(networkName)


        //const behodlerContracts: BehodlerContracts = await this.fetchBehodlerDeployments(networkName)
        const behodler2 = await this.fetchBehodler2(networkName)
        const behodlerContracts: BehodlerContracts = { Behodler2: behodler2 } as BehodlerContracts
        let contracts: IContracts = { behodler: behodlerContracts }
        this.initialized = true

        await this.setupSubscriptions()

        return contracts
    }

    public addBlockWatcher(watcher: (b: string) => void) {
        this.web3.eth.subscribe('newBlockHeaders', (err, result) => {
            if (result?.number) {
                watcher(result.number.toString())
            }
        })
    }

    public async getTransactionReceipt(hash: string) {
        return await this.web3.eth.getTransactionReceipt(hash)
    }

    public toWei(eth: string, override?: number) {
        const decimalPlaces = override || 18
        if (eth == 'unset') return 'unset'

        if (eth.indexOf('.') !== -1) {
            if (eth.length - eth.indexOf('.') > decimalPlaces) eth = eth.substring(0, eth.indexOf('.') + decimalPlaces)
        }
        if (!override) return this.web3.utils.toWei(eth)
        const factor = new BigNumber(10).pow(override)
        return new BigNumber(eth).times(factor).toString()
    }

    public fromWei(wei: string, override?: number) {
        try {
            BigNumber.config({ DECIMAL_PLACES: 20 })
            if (wei == 'unset') return 'unset'
            if (!override) return this.web3.utils.fromWei(wei)
            const bigWei = new BigNumber(wei)
            const factor = new BigNumber(10).pow(override)
            return bigWei.div(factor).toString()
        } catch {
            return '0'
        }
    }

    public async enableToken(tokenAddress: string, owner: string, spender: string, callBack?: (err: any, hash: string) => void): Promise<void> {
        const token: ERC20 = new this.web3.eth.Contract(ABIs.ERC20 as any, tokenAddress).methods as unknown as ERC20
        await token
            .approve(spender, API.UINTMAX)
            .send({ from: owner }, callBack)
            .catch((err) => console.log('user rejected'))
    }

    public async getToken(tokenAddress: string): Promise<ERC20> {
        var token = new this.web3.eth.Contract(ABIs.ERC20 as any, tokenAddress).methods as unknown as ERC20
        token.address = tokenAddress
        return token
    }

    public async getPyroTokenV2(tokenAddress: string, fromBase?: boolean): Promise<PyrotokenV2> {
        let pyroAddress: string = tokenAddress
        if (fromBase) {
            const LR = (new this.web3.eth.Contract(ABIs.LiquidityReceiverV1 as any, this.contractAddresses.LiquidityReceiverV1).methods as LiquidityReceiverV2)
            pyroAddress = await LR.baseTokenMapping(tokenAddress).call()
        }
        const pv2 = await (new this.web3.eth.Contract(ABIs.PyroToken_V2 as any, pyroAddress).methods as PyrotokenV2)
        pv2.address = pyroAddress
        return pv2
    }

    public async getPyroTokenV3(tokenAddress: string, fromBase?: boolean): Promise<PyroTokenV3> {
        let pyroAddress = tokenAddress
        if (fromBase) {
            const LR = (new this.web3.eth.Contract(ABIs.LiquidityReceiver as any, this.contractAddresses.LiquidityReceiver).methods as LiquidityReceiverV3)
            pyroAddress = await LR.getPyroToken(pyroAddress).call()
        }
        const token = await (new this.web3.eth.Contract(ABIs.PyroToken as any, pyroAddress).methods as unknown as PyroTokenV3)
        token.address = pyroAddress
        return token
    }

    public generateNewEffects(tokenAddress: string, currentAccount: string, useEth: boolean, decimalPlaces: number = 18): Token {
        const token: ERC20 = new this.web3.eth.Contract(ABIs.ERC20 as any, tokenAddress).methods as unknown as ERC20
        if (useEth) {
            return new EtherEffects(this.web3, token, currentAccount)
        }

        return new ERC20Effects(this.web3, token, currentAccount, decimalPlaces)
    }

    public async getEthBalance(account: string): Promise<string> {
        return await this.web3.eth.getBalance(account)
    }

    private async setupSubscriptions(): Promise<void> {
        this.newContractObservable = Observable.create(async (observer) => {
            const newContractObserver = async () => {
                if (this.newContracts.weiDai !== '' || this.newContracts.weiDaiBank !== '' || this.newContracts.PRE !== '') observer.next(this.newContracts)
            }

            setInterval(newContractObserver, 1000)
        })
    }

    private async deployBehodlerContract(abi: any, address: string): Promise<deployment> {
        try {
            const contractInstance = await new this.web3.eth.Contract(abi, address)  
            return { methods: contractInstance.methods, address: address, contractInstance }
        } catch (err) {
            console.log('contract failed to load: ' + err)
            return {
                address: '0x0',
                methods: {},
                contractInstance: {},
            }
        }
    }

    private async fetchBehodler2(network: string): Promise<Behodler2Contracts> {
        try {
            let behodler2: Behodler2
            const deployment = await this.deployBehodlerContract(ABIs.Behodler, this.contractAddresses.Behodler)
            behodler2 = deployment.methods
            behodler2.address = this.contractAddresses.Behodler
            const wethAddress = await behodler2.Weth().call()
            const wethDeployment = await this.deployBehodlerContract(ABIs.WETH10, wethAddress)
            const Weth10: Weth = wethDeployment.methods
            Weth10.address = wethAddress

            const lachesisDeployment = await this.deployBehodlerContract(ABIs.Lachesis, this.contractAddresses.Lachesis)
            let lachesis: Lachesis2 = lachesisDeployment.methods
            lachesis.address = this.contractAddresses.LiquidityReceiverV1

            //Note that LiquidityReceiverV1 is for PyroTokensV2 because PyroV1 didn't have a LiquidityReceiver. The inconsistent numbering is unfortunate but ends here.
            //For the purposes of the UI, V2 is for PyroV2 and V3 is for PyroV3. Whoever you are reading this, you will survive this moment. Just take a breath and move on.
            const LRV2Deployment = await this.deployBehodlerContract(ABIs.LiquidityReceiverV1, this.contractAddresses.LiquidityReceiverV1)
            let liquidityReceiverV2: LiquidityReceiverV2 = LRV2Deployment.methods
            liquidityReceiverV2.address = this.contractAddresses.LiquidityReceiverV1

            const LRV3Deployment = await this.deployBehodlerContract(ABIs.LiquidityReceiver, this.contractAddresses.LiquidityReceiver)
            let liquidityReceiverV3: LiquidityReceiverV3 = LRV3Deployment.methods
            liquidityReceiverV3.address = this.contractAddresses.LiquidityReceiverV1

            const pyroWeth10ProxyDeployment = await this.deployBehodlerContract(ABIs.PyroWeth10Proxy, this.contractAddresses.PyroWeth10Proxy)
            let pyroWeth10Proxy: PyroWeth10Proxy = pyroWeth10ProxyDeployment.methods
            pyroWeth10Proxy.address = this.contractAddresses.PyroWeth10Proxy

            const limboTokenProxyRegistryDeployment = await this.deployBehodlerContract(ABIs.TokenProxyRegistry, this.contractAddresses.TokenProxyRegistry)
            let limboTokenProxyRegistry: TokenProxyRegistry = limboTokenProxyRegistryDeployment.methods
            limboTokenProxyRegistry.address = this.contractAddresses.TokenProxyRegistry

            const pyroWethProxyDeployment = await this.deployBehodlerContract(ABIs.PyroWethProxy, this.contractAddresses.PyroWethProxy)
            let pyroWethProxy: PyroWethProxy = pyroWethProxyDeployment.methods
            pyroWethProxy.address = this.contractAddresses.PyroWethProxy

            const pyroV2MigratorDeployment = await this.deployBehodlerContract(ABIs.V2Migrator, this.contractAddresses.V2Migrator)
            let pyroV2Migrator: V2Migrator = pyroV2MigratorDeployment.methods
            pyroV2Migrator.address = this.contractAddresses.V2Migrator

            return {
                Behodler2: behodler2,
                Lachesis: lachesis,
                LiquidityReceiverV2: liquidityReceiverV2,
                LiquidityReceiverV3: liquidityReceiverV3,
                Weth10,
                PyroWeth10Proxy: pyroWeth10Proxy,
                PyroWethProxy: pyroWethProxy,
                LimboTokenProxyRegistry: limboTokenProxyRegistry,
                PyroV2Migrator: pyroV2Migrator,
            }
        } catch (e) {
            console.error('Error: fetchBehodler2', e)
            return defaultBehodler2
        }
    }
}

interface deployment {
    methods: any
    address: string
    contractInstance: any
}

const API: ethereumAPI = new ethereumAPI()

export default API
