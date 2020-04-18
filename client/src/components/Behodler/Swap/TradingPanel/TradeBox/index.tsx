import * as React from 'react'
import ExtendedTextField from "./ExtendedTextField"
import { Grid } from '@material-ui/core'
import { useContext } from 'react'
import tokenListJSON from "../../../../../blockchain/behodlerUI/baseTokens.json"
import { WalletContext } from "../../../../Contexts/WalletStatusContext"
import ArrowDownwardRoundedIcon from '@material-ui/icons/ArrowDownwardRounded';
import { Images } from './ImageLoader'
interface props {

}

export default function TradeBox(props: props) {
    const walletContextProps = useContext(WalletContext)
    const tokenList = tokenListJSON[walletContextProps.networkName]
    let tokenDropDownList = tokenList.map((t, i) => ({ ...t, image: Images[i] }))

    return <Grid
        container
        direction="column"
        justify="space-between"
        alignItems="center"
        spacing={2}>
        <Grid item>
            <ExtendedTextField label="input" dropDownFields={tokenDropDownList} />
        </Grid >
        <Grid item>
            <ArrowDownwardRoundedIcon color="secondary" />
        </Grid>
        <Grid item>
            <ExtendedTextField label="output" dropDownFields={tokenDropDownList}  />
        </Grid>
    </Grid >
}