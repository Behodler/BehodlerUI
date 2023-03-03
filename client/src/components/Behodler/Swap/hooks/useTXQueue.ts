import { useCallback } from 'react';
import { PendingTX } from '../TradingBox3/types';
import { atom, useAtom } from 'jotai'

import API from '../../../../blockchain/ethereumAPI';
import { NotificationType } from '../TradingBox3/components/Notification';

import { useCurrentBlock } from './useCurrentBlock'

const pendingTXQueueAtom = atom<PendingTX[]>([])

export function useTXQueue(notify: Function) {
    const [pendingTXQueue, setPendingTXQueue] = useAtom(pendingTXQueueAtom)
    const block = useCurrentBlock()

    const txQueuePush = (val: PendingTX) => {
        const newQueue = [...pendingTXQueue, val]
        setPendingTXQueue(newQueue)
    }

    const txDequeue = () => {
        let newArray = [...pendingTXQueue]
        newArray.shift()
        setPendingTXQueue(newArray)
    }

    const peekTX = () => {
        if (pendingTXQueue.length == 0)
            return false
        return pendingTXQueue[0]
    }

    const queueUpdateCallback = useCallback(async () => {
        const top = peekTX()
        if (!top) return;
        const receipt = await API.getTransactionReceipt(top.hash)

        if (!!receipt) {
            txDequeue()
            if (receipt.status)
                notify(top.hash, NotificationType.success)
            else
                notify(top.hash, NotificationType.fail)
        }
    }, [block])

    return {
        pendingTXQueue,
        txQueuePush,
        txDequeue,
        peekTX,
        queueUpdateCallback,
    };
}
