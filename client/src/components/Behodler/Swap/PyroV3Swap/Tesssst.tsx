import React from 'react'

import { useMinting } from './hooks/usePyroV3SwapState'

export function Tesssst() {
    const minting = useMinting()

    console.info('render Tesssst');

    return (
        <span>
            {minting ? 'minting' : 'not minting'}
        </span>
    )
}
