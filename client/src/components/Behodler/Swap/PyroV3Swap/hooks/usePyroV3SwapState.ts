import { atom, useSetAtom, useAtomValue } from 'jotai'
import { focusAtom } from 'jotai-optics'

export type PyroV3SwapState = {
    minting: boolean
    redeeming: boolean
    insufficientBalance: boolean
    disabled: boolean
    ready: boolean
}

export const initialPyroV3SwapState: PyroV3SwapState = {
    minting: false,
    redeeming: false,
    insufficientBalance: false,
    disabled: false,
    ready: false,
}

const pyroV3SwapStateAtom = atom(initialPyroV3SwapState)

const getPyroV3SwapStatePropAtom = (prop) => focusAtom(
    pyroV3SwapStateAtom,
    (optic) => optic.prop(prop),
)

const mintingAtom = getPyroV3SwapStatePropAtom('minting')
const redeemingAtom = getPyroV3SwapStatePropAtom('redeeming')
const insufficientBalanceAtom = getPyroV3SwapStatePropAtom('insufficientBalance')
const disabledAtom = getPyroV3SwapStatePropAtom('disabled')
const readyAtom = getPyroV3SwapStatePropAtom('ready')

export const useMinting = () => useAtomValue(mintingAtom)
export const useRedeeming = () => useAtomValue(redeemingAtom)
export const useInsufficientBalance = () => useAtomValue(insufficientBalanceAtom)
export const useDisabled = () => useAtomValue(disabledAtom)
export const useReady = () => useAtomValue(readyAtom)

export const usePyroV3SwapState = (): PyroV3SwapState => {
    return useAtomValue(pyroV3SwapStateAtom)
}

export const useSetMinting = (): Function => {
    const setMinting = useSetAtom(mintingAtom)
    return (value: boolean) => {
        setMinting(value)
    }
}

export const useSetRedeeming = (): Function => {
    const setRedeeming = useSetAtom(redeemingAtom)
    return (value: boolean) => {
        setRedeeming(value)
    }
}

export const useSetInsufficientBalance = (): Function => {
    const setInsufficientBalance = useSetAtom(insufficientBalanceAtom)
    return (value: boolean) => {
        setInsufficientBalance(value)
    }
}

export const useSetDisabled = (): Function => {
    const setDisabled = useSetAtom(disabledAtom)
    return (value: boolean) => {
        setDisabled(value)
    }
}

export const useSetReady = (): Function => {
    const setReady = useSetAtom(readyAtom)
    return (value: boolean) => {
        setReady(value)
    }
}

export const useSetPyroV3SwapState = (): Function => {
    const setMinting = useSetMinting()
    const setRedeeming = useSetRedeeming()
    const setInsufficientBalance = useSetInsufficientBalance()
    const setDisabled = useSetDisabled()
    const setReady = useSetReady()

    const setters = {
        minting: setMinting,
        redeeming: setRedeeming,
        insufficientBalance: setInsufficientBalance,
        disabled: setDisabled,
        ready: setReady,
    }

    return (state) => {
        for (const prop in state) {
            if (typeof setters[prop] === 'function') {
                setters[prop](state[prop])
            }
        }
    }
}
