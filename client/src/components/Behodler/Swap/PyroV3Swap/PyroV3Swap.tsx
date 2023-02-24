import React from 'react'

import { usePyroV3SwapState, useSetMinting, useSetInsufficientBalance } from './hooks/usePyroV3SwapState'
import { Tesssst } from './Tesssst'

export function PyroV3Swap() {
    const pyroV3SwapState = usePyroV3SwapState()
    const setMinting = useSetMinting()
    const setInsufficientBalance = useSetInsufficientBalance()

    const toggleMinting = () => {
        setMinting(!pyroV3SwapState.minting)
    }

    const toggleInsufficientBalance = () => {
        setInsufficientBalance(!pyroV3SwapState.insufficientBalance)
    }

    console.info('render PyroV3Swap');

    return (
        <div style={{ color: 'white' }}>
            <pre>
                {JSON.stringify(pyroV3SwapState)}
            </pre>

            <button onClick={toggleMinting}>
                toggle minting
            </button>

            <button onClick={toggleInsufficientBalance}>
                toggle insufficient balance
            </button>

            <br />

            <Tesssst />
        </div>
    )
}
