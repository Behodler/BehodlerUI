import React, {useState} from 'react'
import styled from 'styled-components'

import { StyledMigrateToPyroV3Button } from "../../PyroV3Migration/styled";
import Modal from "../../../../Common/Modal";

const PyroTokensInfoButton = styled(StyledMigrateToPyroV3Button)`
  font-size: 13px;
  padding: 8px 16px 6px;    
`

export function PyroTokensInfo() {
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

    return (
        <>

            <PyroTokensInfoButton onClick={() => setIsInfoModalOpen(true)}>
                What are PyroTokens?
            </PyroTokensInfoButton>

            <Modal
                isOpen={isInfoModalOpen}
                onDismiss={() => setIsInfoModalOpen(false)}
            >



            </Modal>

        </>
    );
}
