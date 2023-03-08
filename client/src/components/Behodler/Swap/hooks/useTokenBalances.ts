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
const pyroTokenBalancesAtom = atom<TokenBalanceMapping[]>([])

export function useWatchTokenBalancesEffect() {
    const block = useCurrentBlock()
    const { initialized, networkName } = useWalletContext();
    const { baseTokens, pyroTokens } = useTradeableTokensList()
    const accountAddress = useActiveAccountAddress()
    const weth10 = useWeth10Contract()

    const [baseTokenBalances, setBaseTokenBalances] = useAtom(baseTokenBalancesAtom)
    const [pyroTokenBalances, setPyroTokenBalances] = useAtom(pyroTokenBalancesAtom)

    useEffect(() => {
        (async () => {
            const bigBlock = BigInt(block)
            const two = BigInt(2)
            const zero = BigInt(0)

            if (!(bigBlock % two === zero && initialized)) {
                return;
            }

            const baseBalanceResults = await FetchBalances(accountAddress, baseTokens, networkName)
            let baseBalances: TokenBalanceMapping[] = baseTokens.map(t => {
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

            const pyroBalanceResults = await FetchBalances(accountAddress, pyroTokens, networkName)
            let pyroBalances: TokenBalanceMapping[] = pyroTokens.map(t => {
                let hexBalance = pyroBalanceResults.results[t.name].callsReturnContext[0].returnValues[0].hex.toString()
                let address = t.address
                let decimalBalance = API.web3.utils.hexToNumberString(hexBalance)
                return { address, balance: decimalBalance, name: t.name }
            })
            const stringified = JSON.stringify(pyroBalances)
            if (stringified !== JSON.stringify(pyroTokenBalances)) {
                setPyroTokenBalances(pyroBalances)
            }
        })()
    }, [block, initialized])
}

export function useBaseTokenBalances() {
    return useAtomValue(baseTokenBalancesAtom)
}

export function usePyroTokenBalances() {
    return useAtomValue(pyroTokenBalancesAtom)
}
