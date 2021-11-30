import React, {useState} from 'react'
import styled from 'styled-components'

import { StyledMigrateToPyroV3Button } from '../../PyroV3Migration/styled';
import Modal, {
    StyledModalContent,
    StyledModalP,
    StyledModalHeader,
} from '../../../../Common/Modal';
import { Logos } from '../ImageLoader'

const PyroTokensInfoButton = styled(StyledMigrateToPyroV3Button)`
  font-size: 13px;
  padding: 8px 16px 6px;    
`

const NoWrap = styled.span`
  white-space: nowrap;
`

const StyledPyroTokensModalHeader = styled(StyledModalHeader)`
  align-items: center;
  display: flex;
`

const StyledPyroTokensImg = styled.img`
  width: 48px;    
`

const StyledLearnMoreLink = styled.a`
  align-items: center;
  border: 1px solid #c58d2c;
  background-color: transparent;
  border-radius: 4px;
  color: #c58d2c;
  display: inline-block;
  justify-content: center;
  font-size: 14px;
  margin-top: 20px;
  padding: 12px 16px 10px;
  text-decoration: none;

  &:hover {
    background-color: #c58d2c;
    color: #fff;
  }
`

export function PyroTokensInfo() {
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

    const pyrotokensImage = Logos.find(l => l.name === 'Pyrotoken')?.image

    return (
        <>

            <PyroTokensInfoButton onClick={() => setIsInfoModalOpen(true)}>
                What are PyroTokens?
            </PyroTokensInfoButton>

            <Modal
                isOpen={isInfoModalOpen}
                onDismiss={() => setIsInfoModalOpen(false)}
            >
                <StyledModalContent style={{ margin: '1px 0' }}>

                    <StyledPyroTokensModalHeader>
                        <StyledPyroTokensImg src={pyrotokensImage} />
                        <span style={{ margin: '0 8px' }}>What are PyroTokens?</span>
                    </StyledPyroTokensModalHeader>

                    <StyledModalP>
                        Deflation as a service. PyroTokens are an innovative yield aggregating strategy,
                        that rewards holders by taking advantage of the burn of burnable or non-burnable
                        tokens on Behodler (collected as fees).
                    </StyledModalP>

                    <StyledModalP>
                        An automatic incentive for trading on Behodler.
                    </StyledModalP>

                    <StyledModalP>
                        The redeem rate is calculated as:
                        <br />
                        <NoWrap>balance_of_reserve_token / supply_of_pyrotoken</NoWrap>
                    </StyledModalP>

                    <StyledModalP>
                        For instance, if there are 1000 BAT held in reserve and 100 PyroBAT circulating
                        then the redeem rate is <NoWrap>1000 / 100 = 10</NoWrap>.
                        <br />
                        This means if I purchase 1 PyroBAT, I require 10 BAT. Similarly, if I redeem
                        4 PyroBAT, I will receive 40 BAT.
                    </StyledModalP>

                    <StyledLearnMoreLink
                        href="https://docs.behodler.io/dapps/pyrotokens"
                        target="_blank"
                    >
                        Learn more
                    </StyledLearnMoreLink>

                </StyledModalContent>
            </Modal>

        </>
    );
}
