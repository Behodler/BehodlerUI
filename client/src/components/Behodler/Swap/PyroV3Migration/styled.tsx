import styled from 'styled-components'

import { ReactComponent as WarningIcon } from './warning.svg'

export const StyledMigrateToPyroV3Wrapper = styled.div`
  display: flex;
  justify-content: center;
  padding: 20px;
  width: 100%;

  @media (min-width: 1280px) {
    position: absolute;
    top: 0;
  }
`

export const StyledMigrateToPyroV3Box = styled.div`
  align-items: center;
  background-color: rgba(54, 12, 87, 0.24);
  border: 1px solid #3e236c;
  border-radius: 8px;
  color: #9081d2;
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  padding: 12px 24px;

  @media (max-width: 600px) {
    flex-wrap: wrap;
  }
`

export const StyledMigrateToPyroV3Button = styled.button`
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

  @media (max-width: 600px) {
    margin: 10px auto 0;
  }

  &:hover:not(:disabled) {
    background-color: #9081d2;
    color: #0d0523;
    cursor: pointer;
  }

  &:disabled {
    opacity: 0.4;
  }
`

export const StyledMigrateToPyroV3Message = styled.span`
  flex-grow: 1;
  margin: 0 24px;

  @media (max-width: 600px) {
    margin: 0 0 0 20px;
    width: calc(100% - 20px - 24px);
  }
`

export const StyledWarningIcon = styled(WarningIcon)`
  width: 24px;
`

export const Underlined = styled.span`
  text-decoration: underline;
`

export const StyledMigrateToPyroV3ModalButtons = styled.p`
  display: flex;
  margin-top: 24px;
  justify-content: space-between;
  
  > button {
    font-size: 13px;
    padding: 10px 0 8px;
    width: calc(50% - 10px);
  }
`

export const LineBreak = styled.span`
  flex-basis: 100%;
  height: 0;
`
