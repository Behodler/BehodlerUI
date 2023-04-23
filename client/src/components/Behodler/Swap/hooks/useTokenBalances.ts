import { useEffect } from 'react';
import { atom, useAtom, useAtomValue } from 'jotai';

import FetchBalances from '../TradingBox3/FetchBalances';
import { TokenBalanceMapping } from '../TradingBox3/types';
import API from '../../../../blockchain/ethereumAPI';

import { useCurrentBlock } from './useCurrentBlock';
import { useWalletContext } from './useWalletContext';
import { useTradeableTokensList } from './useTradeableTokensList';
import { useActiveAccountAddress } from './useAccount';
import { useWeth10Contract } from './useContracts';

const baseTokenBalancesAtom = atom<TokenBalanceMapping[]>([])
const pyroTokenV2BalancesAtom = atom<TokenBalanceMapping[]>([])
const pyroTokenV3BalancesAtom = atom<TokenBalanceMapping[]>([])

export function useWatchTokenBalancesEffect() {
    const block = useCurrentBlock()
    const { initialized, networkName } = useWalletContext();
    const groups = useTradeableTokensList()
    const accountAddress = useActiveAccountAddress()
    const weth10 = useWeth10Contract()

    const [baseTokenBalances, setBaseTokenBalances] = useAtom(baseTokenBalancesAtom)
    const [pyroTokenV2Balances, setPyroV2TokenBalances] = useAtom(pyroTokenV2BalancesAtom)
    const [pyroTokenV3Balances, setPyroV3TokenBalances] = useAtom(pyroTokenV3BalancesAtom)

    useEffect(() => {
        (async () => {
            const bigBlock = BigInt(block)
            const two = BigInt(2)
            const zero = BigInt(0)

            if (!(bigBlock % two === zero && initialized)) {
                return;
            }

            const baseBalanceResults = await FetchBalances(accountAddress, groups.baseTokens, networkName)
            let baseBalances: TokenBalanceMapping[] = groups.baseTokens.map(t => {
                let hexBalance = baseBalanceResults.results[t.name].callsReturnContext[0].returnValues[0].hex.toString()
                let address = t.address
                let decimalBalance = API.web3.utils.hexToNumberString(hexBalance)
                return { address, balance: decimalBalance, name: t.name }
            })
            const ethBalance = await API.getEthBalance(accountAddress)
            let ethUpdated = baseBalances.map(b => {
                if (b.address === weth10.address) {
                    return { ...b, balance: ethBalance }
                }
                return b
            })
            if (JSON.stringify(ethUpdated) !== JSON.stringify(baseTokenBalances)) {
                setBaseTokenBalances(ethUpdated)
            }

            const pyroV2BalanceResults = await FetchBalances(accountAddress, groups.pyroTokensV2, networkName)
            let pyroBalances: TokenBalanceMapping[] = groups.pyroTokensV2.map(t => {
                let hexBalance = pyroV2BalanceResults.results[t.name].callsReturnContext[0].returnValues[0].hex.toString()
                let address = t.address
                let decimalBalance = API.web3.utils.hexToNumberString(hexBalance)
                return { address, balance: decimalBalance, name: t.name }
            })
            let stringified = JSON.stringify(pyroBalances)
            if (stringified !== JSON.stringify(pyroTokenV2Balances)) {
                setPyroV2TokenBalances(pyroBalances)
            }

            const pyroV3BalanceResults = await FetchBalances(accountAddress, groups.pyroTokensV3, networkName)
            pyroBalances = groups.pyroTokensV3.map(t => {
                let hexBalance = pyroV3BalanceResults.results[t.name].callsReturnContext[0].returnValues[0].hex.toString()
                let address = t.address
                let decimalBalance = API.web3.utils.hexToNumberString(hexBalance)
                return { address, balance: decimalBalance, name: t.name }
            })

            stringified = JSON.stringify(pyroBalances)
            if (stringified !== JSON.stringify(pyroTokenV3Balances)) {
                setPyroV3TokenBalances(pyroBalances)
            }
        })()
    }, [block, initialized])
}

export function useBaseTokenBalances() {
    return useAtomValue(baseTokenBalancesAtom)
}

export function usePyroV2TokenBalances() {
    return useAtomValue(pyroTokenV2BalancesAtom)
}

export function usePyroV3TokenBalances() {
    return useAtomValue(pyroTokenV3BalancesAtom)
}
