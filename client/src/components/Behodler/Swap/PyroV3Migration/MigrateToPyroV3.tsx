import React, { useEffect, useState } from 'react'
import { CircularProgress, Hidden } from '@material-ui/core'
import styled from 'styled-components'
import { lighten } from 'polished'
import _ from 'lodash';
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
    StyledMigrateToPyroV3ModalButtons,
    LineBreak,
} from './styled'
import { PyroTokenInfo, TokenTripletRow, rowsUpdatingAtom } from '../hooks/useTokenRows'
import { atom, useAtom } from 'jotai'
import FetchAllowances from '../TradingBox3/FetchAllowances'
import { useWalletContext } from '../hooks/useWalletContext'
import { useActiveAccountAddress } from '../hooks/useAccount'
import API from 'src/blockchain/ethereumAPI'
import { useTransactions } from '../hooks/useTransactions';
import { NotificationType, useShowNotification } from '../TradingBox3/components/Notification';

const StyledPyroTokensReadmeLink = styled.a`
  color: #9081d2;
  
  &:hover {
    color: ${lighten(0.15, '#9081d2')};
  }

`
enum approvalStatus {
    UNSET,
    UNAPPROVED,
    APPROVED
}
interface MigrationToken extends PyroTokenInfo {
    redemptionApproval: approvalStatus,
    migrationApproval: approvalStatus
}

export const V2PyroTokensPresentInActiveWallet = (pyroTokenV2Balances: TokenTripletRow[]): MigrationToken[] => (
    pyroTokenV2Balances.filter(({ PV2 }) => BigInt(PV2.balance) > 0)
        .map(r => r.PV2 as MigrationToken)
        .map(r => ({ ...r, redemptionApproval: approvalStatus.UNSET, migrationApproval: approvalStatus.UNSET }))
        .map(t => (BigInt(t.redeemAllowance) > BigInt(t.balance) ? { ...t, redemptionApproval: approvalStatus.APPROVED } : { ...t, redemptionApproval: approvalStatus.UNAPPROVED }))
);

const V2PresentAtom = atom<MigrationToken[]>([])


const derivedCollections = (redemption: boolean, status: approvalStatus) => atom((get) => {
    const property = redemption ? "redemptionApproval" : "migrationApproval"
    const existingV2 = get(V2PresentAtom);
    return existingV2.filter(t => t[property] == status)
})
const unsetRedemptionAtom = derivedCollections(true, approvalStatus.UNSET);
const unapprovedRedemptionAtom = derivedCollections(true, approvalStatus.UNAPPROVED);
//export to hide modal and link
export const approvedRedemptionAtom = derivedCollections(true, approvalStatus.APPROVED);


const unsetMigrationAtom = derivedCollections(false, approvalStatus.UNSET);
const unapprovedMigrationAtom = derivedCollections(false, approvalStatus.UNAPPROVED);
//export to hide modal and link
export const approvedMigrationAtom = derivedCollections(false, approvalStatus.APPROVED);

export function MigrateToPyroV3(props: {
    isMigrationModalOpen: boolean,
    openMigrationModal: () => void,
    closeMigrationModal: () => void,
    rows: TokenTripletRow[]
}) {
    const {
        isMigrationModalOpen,
        openMigrationModal,
        closeMigrationModal,
        rows,
    } = props;
    const { contracts } = useWalletContext();
    const activeAccountAddress = useActiveAccountAddress()
    const [redemptionClicked, setRedemptionClicked] = useState<boolean>(false)
    const [migrationClicked, setMigrationClicked] = useState<boolean>(false)
    const [pyroV2InWallet, setPyroV2InWallet] = useAtom(V2PresentAtom)
    const [migrationInProgress, setMigrationInProgress] = useState<boolean>(false)
    const [redemptionInProgress, setRedemptionInProgress] = useState<boolean>(false)
    useEffect(() => {
        setPyroV2InWallet(V2PyroTokensPresentInActiveWallet(rows))
    }, [rows])

    const [unsetRedemptions] = useAtom(unsetRedemptionAtom)
    const [unapprovedRedemption] = useAtom(unapprovedRedemptionAtom)
    const [approvedRedemption] = useAtom(approvedRedemptionAtom)
    const migrationContract = contracts.behodler.Behodler2.PyroV2Migrator
    const showNotification = useShowNotification()

    const notify = (hash: string, type: NotificationType) => {
        showNotification(type, hash, () => {

        })
    }

    const broadCast = useTransactions(notify)
    const [unsetMigration] = useAtom(unsetMigrationAtom)
    const [unapprovedMigration] = useAtom(unapprovedMigrationAtom)
    const [approvedMigration] = useAtom(approvedMigrationAtom)


    const disabledMigration = rows.length == 0 || unsetMigration.length > 0 || migrationInProgress
    const disabledRedemption = rows.length == 0 || unsetRedemptions.length > 0

    let redemptionText = "Redeem all V2 PyroTokens"
    if (unapprovedRedemption.length > 0) {
        redemptionText = "Approve V2 PyroTokens for Redemption"
    }

    let migrationText = "Migrate all V2 PyroTokens"
    if (unapprovedMigration.length > 0) {
        migrationText = "Approve V2 PyroTokens for Migration"
    }

    const updateApprovals = async (unset: MigrationToken[], unapproved: MigrationToken[], spender: string) => {
        const tokensToCheck = [...unset, ...unapproved].map(t => ({ holdingToken: t.address, name: t.name, takingToken: spender, balance: t.balance }))
        const allowanceResults = (await FetchAllowances(activeAccountAddress, tokensToCheck))
            .results


        const newTokens: MigrationToken[] = _.cloneDeep(pyroV2InWallet)
        for (let i = 0; i < tokensToCheck.length; i++) {
            const tokenName = tokensToCheck[i].name
            const allowance = API.web3.utils.hexToNumberString(allowanceResults[tokenName].callsReturnContext[0].returnValues[0].hex.toString())
            const balance = tokensToCheck[i].balance
            const index = newTokens.findIndex(t => t.address === tokensToCheck[i].holdingToken)

            //migrationApprovals are all approvalStatus.unset before this assingment
            newTokens[index].migrationApproval = BigInt(allowance) >= BigInt(balance) ? approvalStatus.APPROVED : approvalStatus.UNAPPROVED
        }
        if (!_.isEqual(newTokens, pyroV2InWallet)) {
            setPyroV2InWallet(newTokens)
        }
    }

    useEffect(() => {
        if (unsetMigration.length > 0 || unapprovedMigration.length > 0) {
            updateApprovals(unsetMigration, unapprovedMigration, contracts.behodler.Behodler2.PyroV2Migrator.address)
        }
    }, [unsetMigration, unapprovedMigration])

    useEffect(() => {
        if (redemptionClicked) {
            console.log('redemptionClicked')
            if (unapprovedRedemption.length > 0) {
                const approveAll = async () => {
                    const approvalPromises = unapprovedRedemption.map(
                        async (t) => {
                            const token = await API.getToken(t.address)
                            await broadCast(token, "approve", { from: activeAccountAddress }, t.redeemingAddress, API.UINTMAX)
                        }
                    )
                    await Promise.all(approvalPromises)
                }
                approveAll()
            } else if (approvedRedemption.length > 0 && unsetRedemptions.length == 0 && unapprovedRedemption.length === 0 && !redemptionInProgress) {
                setRedemptionInProgress(true)
                const redeemAll = async () => {
                    const redeemPromises = approvedRedemption.map(async (t) => {
                        const redeemer = await API.getPyroTokenV2(t.redeemingAddress)
                        await broadCast(redeemer, "redeem", { from: activeAccountAddress }, t.balance)
                    })
                    await Promise.all(redeemPromises)
                }
                redeemAll().finally(() => setRedemptionInProgress(false))
            }
            setRedemptionClicked(false)
        }
    }, [redemptionClicked])

    useEffect(() => {
        if (migrationClicked) {
            if (unapprovedMigration.length > 0) {

                const approveAll = async () => {
                    const approvalPromises = unapprovedMigration
                        .map(async (t) => {
                            const token = await API.getToken(t.address)
                            await broadCast(token, "approve", { from: activeAccountAddress }, migrationContract.address, API.UINTMAX)
                        })
                    await Promise.all(approvalPromises)
                }
                approveAll()
            } else if (approvedMigration.length > 0 && unsetMigration.length === 0 && unapprovedMigration.length === 0 && !migrationInProgress) {
                setMigrationInProgress(true)
                const migrateAll = async () => {
                    const tokenInfo = approvedMigration
                        .map(async (t) => {
                            const pyroTokenV2 = await API.getPyroTokenV2(t.address)
                            const baseToken = await (API.getToken(await pyroTokenV2.baseToken().call()))
                            const pv2ReserveBalance = BigInt(await baseToken.balanceOf(pyroTokenV2.address).call())
                            const pyroTokenV3 = await API.getPyroTokenV3(baseToken.address, true)
                            const pyroV2RedeemRate = BigInt(await pyroTokenV2.redeemRate().call())
                            const pyroV3RedeemRate = BigInt(await pyroTokenV3.redeemRate().call())
                            const applyTransferFee: boolean = pv2ReserveBalance > BigInt(t.balance)
                            const conversionRate = (pyroV2RedeemRate * API.ONE * 98n * (applyTransferFee ? 999n : 1n)) / (pyroV3RedeemRate * 100n * (applyTransferFee ? 1000n : 1n))
                            const predictedPyroV3Amount = `${(conversionRate * BigInt(t.balance)) / (API.ONE)}`

                            return {
                                pyroV2Address: t.address,
                                pyroV3Address: pyroTokenV3.address,
                                p2Amount: t.balance,
                                p3Amount: predictedPyroV3Amount
                            }
                        })
                    const values = await Promise.all(tokenInfo)
                    const pv2Addresses: string[] = []
                    const pv3Addresses: string[] = []
                    const pv2Amounts: string[] = []
                    const pv3Amounts: string[] = []
                    values.forEach(v => {
                        pv2Addresses.push(v.pyroV2Address)
                        pv3Addresses.push(v.pyroV3Address)
                        pv2Amounts.push(v.p2Amount)
                        pv3Amounts.push(v.p3Amount)
                    })
                    await broadCast(migrationContract, "migrateMany", { from: activeAccountAddress }, pv2Addresses, pv3Addresses, pv2Amounts, pv3Amounts)
                }
                migrateAll()
                    .finally(() => setMigrationInProgress(false))
            }

            setMigrationClicked(false)
        }
    }, [migrationClicked])

    const [rowsUpdating,] = useAtom(rowsUpdatingAtom)

    return Array.isArray(rows) && !!rows.length && pyroV2InWallet.length > 0 && !rowsUpdating ? (
        <StyledMigrateToPyroV3Wrapper>

            <StyledMigrateToPyroV3Box>

                <StyledWarningIcon />

                <StyledMigrateToPyroV3Message>
                    A new improved version of PyroTokens has been released.&nbsp;
                    <Hidden xsDown><br /></Hidden>
                    {pyroV2InWallet.length > 0 ? (
                        <>
                            To <Underlined>continue earning</Underlined> Behodler trade revenue,
                            migrate to V3.
                        </>
                    ) : (
                        <>
                            There are no PyroTokens V2 present in the connected wallet.
                        </>
                    )}

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
                        See&nbsp;
                        <StyledPyroTokensReadmeLink
                            href="https://github.com/Behodler/pyrotokens3/blob/main/README.md"
                            target="_blank"
                        >
                            this article
                        </StyledPyroTokensReadmeLink>
                        &nbsp;for full details on why PyroTokens3 was a necessary upgrade.
                        <br />
                        In short, it offers reduced cost across the board, improved standards compliance and composability, the introduction of PyroLoans.
                    </StyledModalP>

                    <StyledModalP>
                        NOTE: While PyroTokens2 will continue to work, all Behodler trade revenue will be redirected to the new version. So, migrating is highly recommended.
                    </StyledModalP>

                    <StyledModalP>
                        You can either redeem all your V2 PyroTokens into their resepctive base tokens or you can migrate them to V3
                    </StyledModalP>



                    <StyledMigrateToPyroV3ModalButtons>

                        <StyledMigrateToPyroV3Button
                            disabled={disabledRedemption}
                            onClick={() => { setRedemptionClicked(true) }}>
                            {redemptionText}
                            {redemptionInProgress ? <CircularProgress /> : <div></div>}
                        </StyledMigrateToPyroV3Button>

                        <StyledMigrateToPyroV3Button
                            disabled={disabledMigration}
                            onClick={() => { setMigrationClicked(true) }}>
                            {migrationText}
                            {migrationInProgress ? <CircularProgress /> : <div></div>}
                        </StyledMigrateToPyroV3Button>

                    </StyledMigrateToPyroV3ModalButtons>

                </StyledModalContent>
            </Modal>

        </StyledMigrateToPyroV3Wrapper>
    ) : null
}

