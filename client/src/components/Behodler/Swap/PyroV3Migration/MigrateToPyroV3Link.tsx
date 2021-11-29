import React from 'react'
import styled from 'styled-components'
import { lighten } from 'polished'

import {TokenBalanceMapping} from "../TradingBox3/types";
import {areV2PyroTokensPresentInActiveWallet} from "./MigrateToPyroV3";

const StyledMigrateToPyroV3Link = styled.button`
  background-color: transparent;
  border: 0 none;
  bottom: 10px;
  color: #9081d2;
  outline: 0 none;
  position: absolute;
  right: 10px;
  transition: color 0.2s ease;
  
  &:hover {
    color: ${lighten(0.15, '#9081d2')};
    cursor: pointer;
  }
`

export function MigrateToPyroV3Link(props: {
    openMigrationModal: () => void,
    pyroTokenV2Balances: TokenBalanceMapping[],
}) {
    const { openMigrationModal, pyroTokenV2Balances } = props;

    const walletContainsPyroV2 = areV2PyroTokensPresentInActiveWallet(pyroTokenV2Balances)

    return (
        Array.isArray(pyroTokenV2Balances)
        && !!pyroTokenV2Balances.length
        && walletContainsPyroV2
    ) ? (
        <StyledMigrateToPyroV3Link onClick={openMigrationModal}>
            Migrate to PyroTokens V3
        </StyledMigrateToPyroV3Link>
    ) : null;
}
