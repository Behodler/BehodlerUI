import React from 'react'
import { Hidden } from '@material-ui/core'

import Modal, {
    StyledModalContent,
    StyledModalHeader,
    StyledModalP,
} from '../../../Common/Modal'
import {
    Underlined,
    StyledMigrateToPyroV3Box,
    StyledMigrateToPyroV3Button,
    StyledMigrateToPyroV3Message,
    StyledMigrateToPyroV3Wrapper,
    StyledWarningIcon,
    StyledMigrateToPyroV3ModalButtons, LineBreak,
} from './styled'

export function MigrateToPyroV3(props: {
    isMigrationModalOpen: boolean,
    openMigrationModal: () => void,
    closeMigrationModal: () => void,
}) {
    const {
        isMigrationModalOpen,
        openMigrationModal,
        closeMigrationModal,
    } = props;

    return (
        <StyledMigrateToPyroV3Wrapper>

            <StyledMigrateToPyroV3Box>

                <StyledWarningIcon />

                <StyledMigrateToPyroV3Message>
                    A new improved version of PyroTokens has been released.&nbsp;
                    <Hidden xsDown><br/></Hidden>
                    To <Underlined>continue earning</Underlined> Behodler trade revenue,
                    migrate to V3.
                </StyledMigrateToPyroV3Message>

                <Hidden xsUp>
                    <LineBreak />
                </Hidden>

                <StyledMigrateToPyroV3Button
                    onClick={openMigrationModal}
                >
                    Migrate to V3
                </StyledMigrateToPyroV3Button>

            </StyledMigrateToPyroV3Box>

            <Modal
                onDismiss={closeMigrationModal}
                isOpen={isMigrationModalOpen}
            >
                <StyledModalContent>

                    <StyledModalHeader>
                        Migrate to PyroTokens3
                    </StyledModalHeader>

                    <StyledModalP>
                        PyroTokens3 brings the third phase in Behodler’s super deflationary token wrappers.
                    </StyledModalP>

                    <StyledModalP>
                        <Underlined>Why PyroTokens3</Underlined>
                    </StyledModalP>

                    <StyledModalP>
                        See <Underlined>this article</Underlined> for full details on why PyroTokens3 was a necessary upgrade.
                        <br />
                        In short, it offers reduced cost across the board, improved standards compliance and composability, the introduction of PyroLoans.
                    </StyledModalP>

                    <StyledModalP>
                        NOTE: While PyroTokens2 will continue to work, all Behodler trade revenue will be redirected to the new version. So, migrating is highly recommended.
                    </StyledModalP>

                    <StyledMigrateToPyroV3ModalButtons>

                        <StyledMigrateToPyroV3Button>
                            Redeem all Pyro
                        </StyledMigrateToPyroV3Button>

                        <StyledMigrateToPyroV3Button>
                            Migrate all Pyro
                        </StyledMigrateToPyroV3Button>

                    </StyledMigrateToPyroV3ModalButtons>

                </StyledModalContent>
            </Modal>

        </StyledMigrateToPyroV3Wrapper>
    )
}
