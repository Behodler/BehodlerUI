import { useCallback, useEffect } from 'react';
import { useWalletContext } from './useWalletContext';
import ethereumAPI from 'src/blockchain/ethereumAPI';
import { useCurrentBlock } from './useCurrentBlock';
import { TokenList, ImagePair } from "../TradingBox3/ImageLoader";
import API from 'src/blockchain/ethereumAPI';
import { useActiveAccountAddress } from './useAccount';
import FetchBalances from '../TradingBox3/FetchBalances';
import FetchAllowances from '../TradingBox3/FetchAllowances';
import { atom, useAtom } from 'jotai';
import _ from 'lodash';

export interface TokenInfo {
    name: string,
    address: string,
    balance: string,
    image: string
}

export const emptyToken: TokenInfo = {
    name: "",
    address: "",
    balance: "",
    image: ""
}
export interface PyroTokenInfo extends TokenInfo {
    mint: (amount: string) => void,//if a proxy, implement special code, else just use default
    redeem: (amount: string) => void,//if a proxy, implement special code, else just use default,
    mintAllowance: string
    redeemAllowance: string
    redeemingAddress: string,

}

export interface TokenTripletRow {
    base: TokenInfo,
    PV2: PyroTokenInfo,
    PV3: PyroTokenInfo
}
const truncateFactory = (length: number) => (str: string) => {
    if (str.length < length)
        return str
    return str.substring(0, length)
}

export const rowsAtom = atom<TokenTripletRow[]>([]);
//Note to future devs: chatGpt explains jotai atoms better than the official docs 
export const daiAtom = atom<string>("0x0")
const approvalUpdateCheckAtom = atom<string>("0")
export const rowsUpdatingAtom = atom<boolean>(false)
export function useTokenRows(): void {

    const trunc = truncateFactory(60)
    const [rows, setRows] = useAtom(rowsAtom)
    const [, setRowsUpdating] = useAtom(rowsUpdatingAtom)
    const { networkName, initialized, contracts } = useWalletContext()
    const block = useCurrentBlock()
    const accountAddress = useActiveAccountAddress()
    const [, setDaiAddress] = useAtom(daiAtom)
    const [lastApprovalChecked, setLastApprovalChecked] = useAtom(approvalUpdateCheckAtom)

    const updateRow = (newRows: TokenTripletRow[]) => {
        setRows(newRows)
    }
    const rowUpdateCallBack = useCallback(async () => {
        const apiTokens = ethereumAPI.tokenConfigs
            .filter(({ displayName }) => !['dai', 'eye', 'scarcity', 'weidai'].includes(displayName.toLocaleLowerCase()))

        setDaiAddress(ethereumAPI.tokenConfigs.find(({ displayName }) => displayName.toLowerCase() === 'dai')?.address || '0x0')

        let tokenRows: TokenTripletRow[] = []
        //For async blocks, for loops cut down on code noise
        for (let i = 0; i < apiTokens.length; i++) {
            const config = apiTokens[i]

            let configId = config.displayName.toLowerCase()
            configId = configId == "weth" ? "eth" : configId
            const imagePair: ImagePair = TokenList.find(pair => pair.baseToken.name.toLowerCase() === configId)
                || { baseToken: { image: '', name: '' }, pyroToken: { image: '', name: '' } }

            const baseToken: TokenInfo = {
                address: config.address,
                name: config.displayName,
                balance: "0",
                image: imagePair.baseToken.image
            }


            const pyroV2Instance = await API.getPyroTokenV2(config.pyroV2Address)
            const pyroV3Intance = await API.getPyroTokenV3(config.pyroV3Address)
            let pyroTokenV2Mint = async (amount: string) => {
                //nothing because we don't want anymore minting              
            }
            let pyroTokenV3Mint = async (amount: string) => {
                await pyroV3Intance.mint(accountAddress, amount)
            }

            let pyroTokenV2Redeem = async (amount: string) => {
                await pyroV2Instance.redeem(amount)
            }

            let pyroTokenV3Redeem = async (amount: string) => {
                await pyroV3Intance.redeem(accountAddress, amount)
            }


            if (configId === "eth") {
                pyroTokenV2Redeem = async (amount: string) => {
                    await contracts.behodler.Behodler2.PyroWeth10Proxy.redeem(amount)
                }

                pyroTokenV3Mint = async (amount: string) => {
                    await contracts.behodler.Behodler2.PyroWethProxy.mint(amount)
                }

                pyroTokenV3Redeem = async (amount: string) => {
                    await contracts.behodler.Behodler2.PyroWethProxy.redeem(amount)
                }

                //TODO: redeem and mint functions via cliff Faproxies

            } else {
                //TODO: just before Limbo launch insert cliff face logic
            }


            //populate base
            let pyroV2Token: PyroTokenInfo = {
                address: config.pyroV2Address,
                name: config.pyroDisplayName + " (V2)",
                balance: "0",
                image: imagePair.pyroToken.image,
                mint: pyroTokenV2Mint,
                redeem: pyroTokenV2Redeem,
                mintAllowance: "0",
                redeemAllowance: "0",
                redeemingAddress: configId === "eth" ? contracts.behodler.Behodler2.PyroWeth10Proxy.address : config.pyroV2Address
            }

            let pyroV3Token: PyroTokenInfo = {
                address: config.pyroV3Address,
                name: config.pyroDisplayName + " (V3)",
                balance: "0",
                image: imagePair.pyroToken.image,
                mint: pyroTokenV3Mint,
                redeem: pyroTokenV3Redeem,
                mintAllowance: "0",
                redeemAllowance: "0",
                redeemingAddress: configId === "eth" ? contracts.behodler.Behodler2.PyroWethProxy.address : config.pyroV2Address
            }
            let row: TokenTripletRow = {
                base: baseToken,
                PV2: pyroV2Token,
                PV3: pyroV3Token
            }
            tokenRows.push(row)
        }
        if (!_.isEqual(tokenRows, rows)) {
            updateRow(tokenRows)
        }


    }, [networkName, accountAddress])

    useEffect(() => {
        setRowsUpdating(true)
        rowUpdateCallBack()
    }, [networkName, accountAddress])

    const rowIsEth = (row: TokenTripletRow) => {
        const displayName = row.base.name.toLocaleLowerCase()

        const condition = displayName === 'eth' || displayName === 'weth'
        return condition
    }

    const balanceUpdate = useCallback(async () => {
        const bigBlock = BigInt(block)
        const two = BigInt(2)
        const zero = BigInt(0)

        if (!(bigBlock % two === zero)) {
            return;
        }
        if (rows.length === 0)
            return

        const newRows = _.cloneDeep(rows)
        const ethRowIndex = rows.findIndex(rowIsEth)
        newRows[ethRowIndex].base.balance = await API.getEthBalance(accountAddress)

        //TODO: update this list below for proxy balacnce fethcing
        const tokenNameBalances = [
            //base tokens excluding weth
            ...newRows.filter(r => r.base.address !== rows[ethRowIndex].base.address)
                .map(r => ({ baseAddress: r.base.address, address: r.base.address, name: trunc(r.base.name) })),
            //pV2
            ...newRows.map(r => ({ baseAddress: r.base.address, address: r.PV2.address, name: trunc(r.PV2.name) })),
            //pv3
            ...newRows.map(r => ({ baseAddress: r.base.address, address: r.PV3.address, name: trunc(r.PV3.name) }))];


        const balanceResult = (await FetchBalances(accountAddress, tokenNameBalances))
            .results


        for (let i = 0; i < newRows.length; i++) {

            const baseName = trunc(newRows[i].base.name)
            const pv2Name = trunc(newRows[i].PV2.name)
            const pv3Name = trunc(newRows[i].PV3.name)

            try {


                const baseHexBalance = i === ethRowIndex ? '' : balanceResult[baseName].callsReturnContext[0].returnValues[0].hex.toString()
                const pv2HexBalance = balanceResult[pv2Name].callsReturnContext[0].returnValues[0].hex.toString()
                const pv3HexBalance = balanceResult[pv3Name].callsReturnContext[0].returnValues[0].hex.toString()

                newRows[i].base.balance = i === ethRowIndex ? newRows[ethRowIndex].base.balance : API.web3.utils.hexToNumberString(baseHexBalance)
                newRows[i].PV2.balance = API.web3.utils.hexToNumberString(pv2HexBalance)
                newRows[i].PV3.balance = API.web3.utils.hexToNumberString(pv3HexBalance)
            } catch (e) {

                throw e + '\n' + `offending names: ${baseName}, ${pv2Name}, ${pv3Name}`
            }
        }

        if (!_.isEqual(newRows, rows)) {
            updateRow(newRows)
        }
        setRowsUpdating(false)
    }, [block, accountAddress, rows])

    useEffect(() => {
        balanceUpdate()
    }, [block, accountAddress, rows])

    const approvalUpdateCallBack = useCallback(async () => {
        const bigBlock = BigInt(block)
        const TWO = BigInt(2)
        const ZERO = 0n
        const bigApproval = BigInt(lastApprovalChecked)
        const shouldUpdate = bigApproval == ZERO || (bigBlock - bigApproval) > TWO
        if (!(initialized || shouldUpdate)) {
            return;
        }
        setLastApprovalChecked(block)

        const newRows: TokenTripletRow[] = _.cloneDeep(rows)
        const ethRowIndex = rows.findIndex(rowIsEth)
        for (let i = 0; i < newRows.length; i++) {
            let minting: boolean = i === 0//1 is redeeming
            if (i === ethRowIndex) {

                if (minting) {
                    newRows[ethRowIndex].PV2.mintAllowance = API.UINTMAX
                    newRows[ethRowIndex].PV3.mintAllowance = API.UINTMAX
                }
                else {
                    const v2ProxyAddress = contracts.behodler.Behodler2.PyroWeth10Proxy.address
                    const v3ProxyAddress = contracts.behodler.Behodler2.PyroWethProxy.address
                    const pyroWethV2 = await API.getPyroTokenV2(newRows[ethRowIndex].PV2.address)
                    const pyroWethV3 = await API.getPyroTokenV3(newRows[ethRowIndex].PV3.address)
                    const v2Allowance = await pyroWethV2.allowance(accountAddress, v2ProxyAddress).call()
                    const v3Allowance = await pyroWethV3.allowance(accountAddress, v3ProxyAddress).call()

                    newRows[i].PV2.redeemAllowance = v2Allowance
                    newRows[i].PV3.redeemAllowance = v3Allowance
                }
                continue
            }

            const pv2addresses = rows.map(r => ({ name: r.PV2.name, holdingToken: minting ? r.base.address : r.PV2.address, takingToken: r.PV2.address }))
            const pv3addresses = rows.map(r => ({ name: r.PV3.name, holdingToken: minting ? r.base.address : r.PV3.address, takingToken: r.PV3.address }))
            const addressOnly = [...pv2addresses, ...pv3addresses]
            const allowanceResults = (await FetchAllowances(accountAddress, addressOnly))
                .results


            for (let i = 0; i < newRows.length; i++) {

                const pv2Name = newRows[i].PV2.name
                const pv3Name = newRows[i].PV3.name
                const pv2Allowance = API.web3.utils.hexToNumberString(allowanceResults[pv2Name].callsReturnContext[0].returnValues[0].hex.toString())
                const pv3Allowance = API.web3.utils.hexToNumberString(allowanceResults[pv3Name].callsReturnContext[0].returnValues[0].hex.toString())

                const property = minting ? "mintAllowance" : "redeemAllowance"

                newRows[i].PV2[property] = pv2Allowance
                newRows[i].PV3[property] = pv3Allowance
            }
        }
        if (!_.isEqual(newRows, rows)) {
            updateRow(newRows)
        }

    }, [block, rows])

    useEffect(() => {
        approvalUpdateCallBack()
    }, [block, rows])

}

