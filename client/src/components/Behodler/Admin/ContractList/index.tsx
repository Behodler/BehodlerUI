import * as React from 'react'
// import { useState } from 'react'
// import { useTheme, withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import { ListItemText } from '@material-ui/core';
interface contractListProps {
    selectContract: (contract: string) => void
}

function ContractList(props: contractListProps) {

    return (
        <List>
            <ListItem button>
                <ListItemText primary="Lachesis: 0xdeadbeef101010" onClick={() => props.selectContract('Lachesis')} />
            </ListItem>
            <ListItem button>
                <ListItemText primary="Bellows: 0xacadbeea202020" onClick={() => props.selectContract('Bellows')} />
            </ListItem>
        </List>
    )
}

export default ContractList