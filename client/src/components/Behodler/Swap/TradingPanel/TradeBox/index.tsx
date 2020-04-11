import * as React from 'react'
import ExtendedTextField from "./ExtendedTextField"
import { List, ListItem } from '@material-ui/core'

interface props {

}

export default function TradeBox(props: props) {
    return <List>
        <ListItem>
            <ExtendedTextField text="input" />
        </ListItem>
        <ListItem>
            <ExtendedTextField text="output" />
        </ListItem>
    </List>
}