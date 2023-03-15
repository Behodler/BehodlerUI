import Web3 from 'web3'
import { Observable } from 'rxjs'
import BigNumber from 'bignumber.js'
import { TokenProxyRegistryAbi } from '@behodler/sdk/abis/limbo'
import { V2MigratorAbi } from '@behodler/sdk/abis/pyrotokens3'

import IContracts, { BehodlerContracts, DefaultBehodlerContracts, defaultBehodler2, Behodler2Contracts } from './IContracts'
import { ERC20 } from './contractInterfaces/ERC20'
import { Pyrotoken } from './contractInterfaces/behodler2/Pyrotoken'
import { Weth } from './contractInterfaces/behodler/Weth'
import { ERC20Effects } from './observables/ERC20'
import { EtherEffects } from './observables/Ether'
import Token from './observables/Token'
import ERC20JSON from './behodlerUI/ERC20.json'
import BehodlerContractMappings from '../temp/BehodlerABIAddressMapping.json'
import Behodler2ContractMappings from '../blockchain/behodler2UI/Behodler.json'
import Lachesis2Json from '../blockchain/behodler2UI/Lachesis.json'
import LiquidityReceiverJson from '../blockchain/behodler2UI/LiquidityReceiver.json'
import PyroWeth10ProxyJson from '../blockchain/behodler2UI/PyroWeth10Proxy.json'
import { Behodler2 } from './contractInterfaces/behodler2/Behodler2'
import Behodler2Addresses from './behodler2UI/Addresses.json'
import { Lachesis as Lachesis2 } from './contractInterfaces/behodler2/Lachesis'
import { LiquidityReceiver } from './contractInterfaces/behodler2/LiquidityReceiver'
import Weth10JSON from './behodler2UI/WETH10.json'
import PyrotokenJSON from './behodler2UI/Pyrotoken.json'
import { PyroWeth10Proxy } from './contractInterfaces/behodler2/PyroWeth10Proxy'
import { TokenProxyRegistry } from "./contractInterfaces/limbo/TokenProxyRegistry";
import { V2Migrator } from "./contractInterfaces/pyrotokens/V2Migrator";

interface newContracts {
    weiDai: string
    weiDaiBank: string
    PRE: string
}

class ethereumAPI {
    private newContracts: newContracts = { weiDai: '', weiDaiBank: '', PRE: '' }

    public initialized: boolean
    public newContractObservable: Observable<newContracts>
    public networkMapping: { [key: number]: string }
    public contractsAvailable: string[]
    public web3: Web3
    public scarcityEffects: ERC20Effects
    public UINTMAX: string = '115792089237316000000000000000000000000000000000000000000000000000000000000000'
    public ONE = BigInt('1000000000000000000')
    constructor() {
        //TODO: conditionally fetch addresses from dev server. ChainID 1337
        /*fetch("http://localhost:1024/get-deployment-addresses",{mode:'cors',method:'GET',credentials:"omit",cache:"no-cache"})

        .then((response) => response.json())
        .catch(err => console.log(err))
        .then((data) => console.log(data));
        */
        this.networkMapping = {
            '1': 'main',
            '2': 'morden',
            '3': 'ropsten',
            '4': 'rinkeby',
            '5': 'goerli',
            '42': 'kovan',
            '66': 'private',
            '1337': 'private',
            '11155111':'sepolia'
        }
        // if we want to add more chains, add their ids and names in this.networkMapping and add their names to the array below
        this.contractsAvailable = ['main', 'sepolia']
    }

    public async initialize(chainId, currentAccount: string): Promise<IContracts> {
        const network = this.networkMapping[chainId]
        if (!network) return Promise.reject('NETWORK_NOT_SUPPORTED')

        const isProductionNetwork = this.contractsAvailable.filter((allowedNetwork) => allowedNetwork === network).length > 0
        // development is a fallback for networks that do not have contracts yet
        const networkName = isProductionNetwork ? network : 'development'

        const behodlerContracts: BehodlerContracts = await this.fetchBehodlerDeployments(networkName)
        behodlerContracts.Behodler2 = await this.fetchBehodler2(networkName)
        let contracts: IContracts = { behodler: behodlerContracts }
        this.initialized = true
        this.scarcityEffects = new ERC20Effects(this.web3, behodlerContracts.Scarcity, currentAccount)

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
        const token: ERC20 = new this.web3.eth.Contract(ERC20JSON.abi as any, tokenAddress).methods as unknown as ERC20
        await token
            .approve(spender, API.UINTMAX)
            .send({ from: owner }, callBack)
            .catch((err) => console.log('user rejected'))
    }

    public async getToken(tokenAddress: string, network: string): Promise<ERC20> {
        var token = new this.web3.eth.Contract(ERC20JSON.abi as any, tokenAddress).methods as unknown as ERC20
        token.address = tokenAddress
        return token
    }

    public async getPyroToken(tokenAddress: string, network: string): Promise<Pyrotoken> {
        return await (new this.web3.eth.Contract(PyrotokenJSON.abi as any, tokenAddress).methods as unknown as Pyrotoken)
    }

    public generateNewEffects(tokenAddress: string, currentAccount: string, useEth: boolean, decimalPlaces: number = 18): Token {
        const token: ERC20 = new this.web3.eth.Contract(ERC20JSON.abi as any, tokenAddress).methods as unknown as ERC20
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

    private async fetchBehodlerDeployments(network: string): Promise<BehodlerContracts> {
        try {
            let behodlerContracts: BehodlerContracts = DefaultBehodlerContracts
            let mappingsList = BehodlerContractMappings[network]
            const keys = Object.keys(behodlerContracts).filter((key) => key !== 'Sisyphus' && key !== 'Nimrodel' && key !== 'Behodler2')
            keys.forEach((key) => {
                const alternateKey = key == 'Weth' ? 'MockWeth' : 'BADKEY'
                const currentMapping = mappingsList.filter((mapping) => mapping.contract == key || mapping.contract == alternateKey)[0]
                this
                    .deployBehodlerContract(currentMapping.abi, currentMapping.address)
                    .then((deployment) => {
                        behodlerContracts[key] = deployment.methods
                        behodlerContracts[key].address = deployment.address
                    })
                    .catch(err => {
                        throw(err)
                    });
            })
            return behodlerContracts
        } catch (e) {
            console.error('Error: fetchBehodlerDeployments', e)
            return DefaultBehodlerContracts
        }
    }

    private async fetchBehodler2(network: string): Promise<Behodler2Contracts> {
        try {
            let behodler2: Behodler2
            const addresses = Behodler2Addresses[network]

            const deployment = await this.deployBehodlerContract(Behodler2ContractMappings.abi, addresses.behodler)
            behodler2 = deployment.methods
            behodler2.address = addresses.behodler

            const wethAddress = await behodler2.Weth().call()
            const wethDeployment = await this.deployBehodlerContract(Weth10JSON.abi, wethAddress)
            const Weth10: Weth = wethDeployment.methods
            Weth10.address = wethAddress

            const lachesisDeployment = await this.deployBehodlerContract(Lachesis2Json.abi, addresses.lachesis)
            let lachesis: Lachesis2 = lachesisDeployment.methods
            lachesis.address = addresses.liquidityReceiver

            const liquidityDeployment = await this.deployBehodlerContract(LiquidityReceiverJson.abi, addresses.liquidityReceiver)
            let liquidityReceiver: LiquidityReceiver = liquidityDeployment.methods
            liquidityReceiver.address = addresses.liquidityReceiver

            const pyroWeth10ProxyDeployment = await this.deployBehodlerContract(PyroWeth10ProxyJson.abi, addresses.pyroWeth10Proxy)
            let pyroWeth10Proxy: PyroWeth10Proxy = pyroWeth10ProxyDeployment.methods
            pyroWeth10Proxy.address = addresses.pyroWeth10Proxy

            const limboTokenProxyRegistryDeployment = await this.deployBehodlerContract(TokenProxyRegistryAbi, addresses.limboTokenProxyRegistry)
            let limboTokenProxyRegistry: TokenProxyRegistry = limboTokenProxyRegistryDeployment.methods
            limboTokenProxyRegistry.address = addresses.limboTokenProxyRegistry
            pyroWeth10Proxy.address = addresses.pyroWeth10Proxy

            const pyroV2MigratorDeployment = await this.deployBehodlerContract(V2MigratorAbi, addresses.pyroV2Migrator)
            let pyroV2Migrator: V2Migrator = pyroV2MigratorDeployment.methods
            pyroV2Migrator.address = addresses.pyroV2Migrator

            return {
                Behodler2: behodler2,
                Lachesis: lachesis,
                LiquidityReceiver: liquidityReceiver,
                Weth10,
                PyroWeth10Proxy: pyroWeth10Proxy,
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
