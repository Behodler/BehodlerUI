import React from 'react'
import styled from 'styled-components'

import { TokenInput } from './TokenInput'
import { BehodlerMonster } from './BehodlerMonster'
import { SwapButton } from './SwapButton'

const StyledSwapLayout = styled.div``
const StyledInputsAndMonster = styled.div``

export function TradingUI() {
    return (
        <StyledSwapLayout>

            <StyledInputsAndMonster>
                <TokenInput />
                <BehodlerMonster />
                <TokenInput />
            </StyledInputsAndMonster>

            <SwapButton />

        </StyledSwapLayout>
    )
}
