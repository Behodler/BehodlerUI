
import React, { useEffect, useState } from 'react'
import Modal, { StyledModalContent, StyledModalHeader, StyledModalP } from 'src/components/Common/Modal';
import { StyledMigrateToPyroV3Button, StyledMigrateToPyroV3ModalButtons } from '../../PyroV3Migration/styled';
import { useCurrentBlock } from '../../hooks/useCurrentBlock';
import API from 'src/blockchain/ethereumAPI';
import { useActiveAccountAddress } from '../../hooks/useAccount';
import _ from "lodash"
import { PyrotokenV2 } from 'src/blockchain/contractInterfaces/behodler2/PyrotokenV2';
import { useTransactions } from '../../hooks/useTransactions';
import { NotificationType, useShowNotification } from './Notification';
import { rowsUpdatingAtom } from '../../hooks/useTokenRows';
import { useAtom } from 'jotai';
enum ButtonPosition {
    base,
    pyro
}
type buttonTypes = 'MINT' | 'DISABLE'
const isTestnet = (network: string) => network === "sepolia" || network === "private"

interface TokenPair {
    base: PyrotokenV2,
    pyro: PyrotokenV2,
    lastMinted: string
}
const mintAmount = (BigInt(`${API.ONE}`) * 100n).toString()

export default function TestnetFaucet(props: { network: string }) {
    const [showMenu, setShowMenu] = useState(false);
    const [mintButtonClicked, setMintButtonClicked] = useState<boolean[]>([false, false])
    const [buttonDisabled, setButtonDisabled] = useState<boolean[]>([false, false])
    const account = useActiveAccountAddress()
    const block = BigInt(useCurrentBlock())
    const [tokenList, setTokenList] = useState<TokenPair[]>([])
    const showNotification = useShowNotification()
    const notify = (hash: string, type: NotificationType) => {
        showNotification(type, hash, () => {

        })
    }

    const broadCast = useTransactions(notify)
    const updateFactory = (types: buttonTypes) => (position: ButtonPosition, value: boolean) => {
        const newVals = types === 'MINT' ? [...mintButtonClicked] : [...buttonDisabled]
        newVals[position] = value
        if (types === 'MINT') setMintButtonClicked(newVals); else setButtonDisabled(newVals)
    }

    const mintClickUpdate = updateFactory('MINT')
    const disableUpdate = updateFactory('DISABLE')

    useEffect(() => {

        disableUpdate(ButtonPosition.base, tokenList.length === 0)
        disableUpdate(ButtonPosition.pyro, tokenList.length === 0)

        if (block % 3n !== 0n) {
            return
        }
        const populateTokenList = async () => {
            if (tokenList.length > 0)
                return
            const forbiddenTokens = ["weth", "eth", "dai", "weidai", "eye"]
            const tokens = API.tokenConfigs
                .filter(t => forbiddenTokens.filter(f => f === t.displayName.toLocaleLowerCase()).length === 0)
                .filter(t => t.displayName.indexOf('Uni') === -1)

            let newTokenList: TokenPair[] = []
            for (let i = 0; i < tokens.length; i++) {
                let config = tokens[i]

                let base = await API.getPyroTokenV2(config.address)

                let pyro = await API.getPyroTokenV2(config.pyroV2Address)
                const lastMinted = await base.lastMinted(account).call()
                newTokenList.push({
                    base,
                    pyro,
                    lastMinted
                })
            }
            setTokenList(newTokenList)
        }

        const updateLastMinted = async () => {
            if (tokenList.length > 0)
                return
            const newList: TokenPair[] = _.cloneDeep(tokenList)
            for (let i = 0; i < tokenList.length; i++) {
                const current = newList[i]
                const lastBase = BigInt(await current.base.lastMinted(account).call())
                const lastPyro = BigInt(await current.pyro.lastMinted(account).call())

                const moreRecent = lastBase > lastPyro ? lastBase : lastPyro
                if (BigInt(current.lastMinted) > moreRecent) {
                    newList[i].lastMinted = `${moreRecent}`
                }
            }

            if (!_.isEqual(newList, tokenList)) {
                setTokenList(newList)
            }
        }
        populateTokenList()
        updateLastMinted()
    }, [block])


    const [rowsUpdating,] = useAtom(rowsUpdatingAtom)

    useEffect(() => {
        // Add keydown listener
        const handleKeyDown = (event) => {
            // Check if tilde was pressed
            if (event.key === '`') {

                setShowMenu(prevState => !prevState);
            }
        }

        document.addEventListener('keydown', handleKeyDown);

        // Remove event listener on cleanup
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        }
    }, []); // Empty dependency array ensures effect runs only on mount and unmount

    useEffect(() => {
        const handleMint = async () => {
            const listToMint = tokenList.filter(t => BigInt(block) - BigInt(t.lastMinted) > 1)
            if (mintButtonClicked[ButtonPosition.base]) {

                for (let i = 0; i < listToMint.length; i++) {
                    await broadCast(listToMint[i].base, "mint", { from: account }, mintAmount)
                }
                mintClickUpdate(ButtonPosition.base, false)

            }

            if (mintButtonClicked[ButtonPosition.pyro]) {

                for (let i = 0; i < listToMint.length; i++) {
                    const allowance = BigInt(await listToMint[i].base.allowance(account, listToMint[i].pyro.address).call())
                    const ONE = `${API.ONE}`
                    if (allowance < BigInt(ONE)) {
                        const baseName = await listToMint[i].base.name().call()

                        await broadCast(listToMint[i].base, "approve", { from: account }, listToMint[i].pyro.address, API.UINTMAX).catch(err => {
                            console.log(`error on approve for ${baseName}:  ${JSON.stringify(err)}`)
                        })

                    } else {
                        const pyroName = await listToMint[i].pyro.name().call()
                        await broadCast(listToMint[i].pyro, "mint", { from: account }, mintAmount).catch(err => {

                            console.log('error on mint for ' + pyroName + ", " + err)
                        })
                    }
                }
                mintClickUpdate(ButtonPosition.pyro, false)
            }
        }
        handleMint()
    }, [mintButtonClicked])


    const closeFaucetMenu = () => setShowMenu(false)

    return <div>
        {isTestnet(props.network) ? <Modal
            onDismiss={closeFaucetMenu}
            isOpen={showMenu && !rowsUpdating}
        >
            <StyledModalContent>

                <StyledModalHeader>
                    Super Secret Testnet Faucet codename "NeverSayWen"
                </StyledModalHeader>

                <StyledModalP>
                    Mint base tokens and PyroToken version 2.
                    This popup is currently only accessible in Sepolia via the tilde key.
                </StyledModalP>



                <StyledMigrateToPyroV3ModalButtons>

                    <StyledMigrateToPyroV3Button
                        onClick={() => { mintClickUpdate(ButtonPosition.base, true) }}>
                        Mint Base Tokens

                    </StyledMigrateToPyroV3Button>

                    <StyledMigrateToPyroV3Button
                        onClick={() => { mintClickUpdate(ButtonPosition.pyro, true) }}>
                        Mint Pyro (V2) Tokens

                    </StyledMigrateToPyroV3Button>

                </StyledMigrateToPyroV3ModalButtons>

            </StyledModalContent>
        </Modal>
            : <div></div>}
    </div>
}
