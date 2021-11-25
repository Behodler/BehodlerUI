import React from 'react'
import styled from 'styled-components'

import { ReactComponent as WarningIcon } from './warning.svg'

const StyledMigrateToPyroV3Wrapper = styled.div`
  display: flex;
  justify-content: center;
  padding: 20px;
  position: absolute;
  top: 0;
  width: 100%;
`

const StyledMigrateToPyroV3Box = styled.div`
  align-items: center;
  background-color: rgba(54, 12, 87, 0.24);
  border: 1px solid #3e236c;
  border-radius: 8px;
  color: #9081d2;
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  padding: 12px 24px;
`

const StyledMigrateToPyroV3Button = styled.button`
  align-items: center;
  background-color: transparent;
  border: 1px solid #9081d2;
  border-radius: 4px;
  color: #9081d2;
  display: flex;
  justify-content: center;
  font-size: 12px;
  padding: 6px 32px 4px;
  transition: all 0.2s ease;

  &:hover {
    background-color: #9081d2;
    color: #25174f;
    cursor: pointer;
  }
`

const StyledMigrateToPyroV3Message = styled.span`
  margin: 0 24px;
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
