import * as React from 'react'
import ExtendedTextField from "./ExtendedTextField"
import { List, ListItem } from '@material-ui/core'
import {useContext} from 'react'
import tokenListJSON from "../../../../../blockchain/behodlerUI/baseTokens.json"
import { WalletContext } from "../../../../Contexts/WalletStatusContext"


interface props {

}

export default function TradeBox(props: props) {
    const walletContextProps = useContext(WalletContext)
    const tokenList = tokenListJSON[walletContextProps.networkName]
    return <List>
        <ListItem>
            <ExtendedTextField label="input" dropDownFields={tokenList} />
        </ListItem>
        <ListItem>
            <ExtendedTextField label="output" dropDownFields={tokenList} />
        </ListItem>
    </List>
}