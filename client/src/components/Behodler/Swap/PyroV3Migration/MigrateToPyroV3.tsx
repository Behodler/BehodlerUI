import React, { useState } from 'react'

import Modal from '../../../Common/Modal'
import {
    Underlined,
    StyledMigrateToPyroV3Box,
    StyledMigrateToPyroV3Button,
    StyledMigrateToPyroV3Message,
    StyledMigrateToPyroV3Wrapper,
    StyledWarningIcon,
    StyledMigrateToPyroV3ModalContent,
    StyledMigrateToPyroV3ModalP,
    StyledMigrateToPyroV3ModalHeader,
    StyledMigrateToPyroV3ModalButtons,
} from './styled'

export function MigrateToPyroV3() {
    const [isMigrateModalOpen, setIsMigrateModalOpen] = useState(false);

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

                <StyledMigrateToPyroV3Button
                    onClick={() => setIsMigrateModalOpen(true)}
                >
                    Migrate to V3
                </StyledMigrateToPyroV3Button>

            </StyledMigrateToPyroV3Box>

            <Modal
                onDismiss={() => setIsMigrateModalOpen(false)}
                isOpen={isMigrateModalOpen}
            >
                <StyledMigrateToPyroV3ModalContent>

                    <StyledMigrateToPyroV3ModalHeader>
                        Migrate to PyroTokens3
                    </StyledMigrateToPyroV3ModalHeader>

                    <StyledMigrateToPyroV3ModalP>
                        PyroTokens3 brings the third phase in Behodler’s super deflationary token wrappers.
                    </StyledMigrateToPyroV3ModalP>

                    <StyledMigrateToPyroV3ModalP>
                        <Underlined>Why PyroTokens3</Underlined>
                    </StyledMigrateToPyroV3ModalP>

                    <StyledMigrateToPyroV3ModalP>
                        See <Underlined>this article</Underlined> for full details on why PyroTokens3 was a necessary upgrade.
                        <br />
                        In short, it offers reduced cost across the board, improved standards compliance and composability, the introduction of PyroLoans.
                    </StyledMigrateToPyroV3ModalP>

                    <StyledMigrateToPyroV3ModalP>
                        NOTE: While PyroTokens2 will continue to work, all Behodler trade revenue will be redirected to the new version. So, migrating is highly recommended.
                    </StyledMigrateToPyroV3ModalP>

                    <StyledMigrateToPyroV3ModalButtons>

                        <StyledMigrateToPyroV3Button>
                            Redeem all Pyro
                        </StyledMigrateToPyroV3Button>

                        <StyledMigrateToPyroV3Button>
                            Migrate all Pyro
                        </StyledMigrateToPyroV3Button>

                    </StyledMigrateToPyroV3ModalButtons>

                </StyledMigrateToPyroV3ModalContent>
            </Modal>

        </StyledMigrateToPyroV3Wrapper>
    )
}
