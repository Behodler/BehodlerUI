import { useMemo } from 'react'
import { atom, useAtom } from 'jotai'

export type PyroV3SwapState = {
    minting: boolean
    redeeming: boolean
}

const mintingAtom = atom(false)
const redeemingAtom = atom(false)

export const useMinting = () => useAtom(mintingAtom)
export const useRedeeming = () => useAtom(redeemingAtom)

export const usePyroV3SwapState = (): PyroV3SwapState => {
    const [minting] = useMinting()
    const [redeeming] = useRedeeming()

    return useMemo(() => ({
        minting,
        redeeming,
    }), [minting, redeeming])
}
