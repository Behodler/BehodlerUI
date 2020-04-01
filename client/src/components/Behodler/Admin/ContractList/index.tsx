import * as React from 'react'
import { useContext } from 'react'
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import {Typography, Button } from '@material-ui/core';
import { WalletContext } from "../../../Contexts/WalletStatusContext"
interface contractListProps {
    selectContract: (contract: string) => void
}

function ContractList(props: contractListProps) {
    const walletContextProps = useContext(WalletContext)
    const contractList = Object.keys(walletContextProps.contracts.behodler)
    return (<List>
        {contractList.map(contract => {
            const nonClickText = ` -> ${walletContextProps.contracts.behodler[contract].address}`
            return <ListItem key={contract}>
                <Button onClick={() => props.selectContract(contract)}>{contract}</Button>
                <Typography variant="caption">{nonClickText}</Typography>
            </ListItem>
        })}
    </List>
    )
}

export default ContractList