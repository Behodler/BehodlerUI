import React from 'react'
import styled from 'styled-components'
import { lighten } from 'polished'

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
}) {
    const { openMigrationModal } = props;

    return (
        <StyledMigrateToPyroV3Link onClick={openMigrationModal}>
            Migrate to PyroTokens V3
        </StyledMigrateToPyroV3Link>
    );
}
