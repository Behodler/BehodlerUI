import { NotificationType } from "../TradingBox3/components/Notification"
import { PendingTX } from "../TradingBox3/types"
import { useCurrentBlock } from "./useCurrentBlock"
import { useTXQueue } from "./useTXQueue"
import { useCallback, useEffect } from "react"

export function useTransactions(notify: (hash: string, type: NotificationType) => void) {
    const { queueUpdateCallback, txQueuePush } = useTXQueue(notify)
    const block = useCurrentBlock()

    const hashBack = (err, hash: string) => {
        if (hash) {
            let t: PendingTX = {
                hash,
            }
            txQueuePush(t)
            notify(hash, NotificationType.pending)
        } else {
            notify(hash, NotificationType.rejected)
        }
    }

    const broadCast = useCallback(async (
        contract,
        method,
        options,
        ...inputParams: any[]
    ) => {
        //Note, for PyroV3, there's an initial param of mintTo address
        return new Promise((resolve, reject) => {
            contract[method](...inputParams)
                .estimateGas(options, async function (error, gas) {
                    if (error) console.error("gas estimation error: " + error);
                    options.gas = gas;

                    const txResult = contract[method](...inputParams)
                        .send(options, hashBack)
                        .catch(reject)
                    resolve(txResult)

                })
        })

    }, [])

    useEffect(() => {
        queueUpdateCallback()
    }, [block])

    return broadCast
}

