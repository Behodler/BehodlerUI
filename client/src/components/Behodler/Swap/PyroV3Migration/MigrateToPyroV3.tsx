import React from 'react'
import styled from 'styled-components'

import { ReactComponent as WarningIcon } from './warning.svg'

const StyledMigrateToPyroV3Wrapper = styled.div`
  display: flex;
  justify-content: center;
  padding: 20px;
`

const StyledMigrateToPyroV3Box = styled.div`
  align-items: center;
  background-color: rgba(27, 14, 70, 0.4);
  border: 1px solid #3d266d;
  border-radius: 8px;
  color: #8072bd;
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  padding: 12px 24px;
`

const StyledMigrateToPyroV3Button = styled.button`
  align-items: center;
  background-color: transparent;
  border: 1px solid #625499;
  border-radius: 4px;
  color: #8072bd;
  display: flex;
  justify-content: center;
  padding: 6px 32px 4px;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(128, 114, 189, 0.6);
    color: #180b3b;
    cursor: pointer;
  }
`

const StyledMigrateToPyroV3Message = styled.span`
  margin: 0 20px;
`

const StyledWarningIcon = styled(WarningIcon)`
  width: 24px;
`

const Underlined = styled.span`
  text-decoration: underline;
`

export function MigrateToPyroV3() {
    return (
        <StyledMigrateToPyroV3Wrapper>
            <StyledMigrateToPyroV3Box>

                <StyledWarningIcon />

                <StyledMigrateToPyroV3Message>
                    A new improved version of PyroTokens has been released.
                    <br/>
                    To <Underlined>continue earning</Underlined> Behodler trade revenue,
                    migrate to V3.
                </StyledMigrateToPyroV3Message>

                <StyledMigrateToPyroV3Button>
                    Migrate to V3
                </StyledMigrateToPyroV3Button>

            </StyledMigrateToPyroV3Box>
        </StyledMigrateToPyroV3Wrapper>
    )
}
