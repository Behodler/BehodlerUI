import { useEffect } from 'react'
import { atom, useAtomValue, useAtom } from 'jotai';

import API from "../../../../blockchain/ethereumAPI";

const currentBlockAtom = atom('')

export function useCurrentBlock() {
    return useAtomValue(currentBlockAtom);
}

export function useWatchCurrentBlockEffect() {
    const [currentBlock, setCurrentBlock] = useAtom(currentBlockAtom);

    useEffect(() => {
        if (!currentBlock) {
            API.web3.eth.getBlockNumber().then(blockNumber => {
                setCurrentBlock(blockNumber.toString());
                API.addBlockWatcher(setCurrentBlock);
            });
        }
    }, [currentBlock])
}
