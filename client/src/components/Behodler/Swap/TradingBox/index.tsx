import * as React from 'react'
import ExtendedTextField from "./ExtendedTextField"
import { Grid } from '@material-ui/core'
import { useContext, useState } from 'react'
import tokenListJSON from "../../../../blockchain/behodlerUI/baseTokens.json"
import { WalletContext } from "../../../Contexts/WalletStatusContext"
import ArrowDownwardRoundedIcon from '@material-ui/icons/ArrowDownwardRounded';
import { Images } from './ImageLoader'


interface props {
}

export default function TradeBox(props: props) {
    const walletContextProps = useContext(WalletContext)
    const tokenList = tokenListJSON[walletContextProps.networkName]
    let tokenDropDownList = tokenList.map((t, i) => ({ ...t, image: Images[i] }))
    const [inputValid, setInputValid] = useState<boolean>(true)
    const [outputValid, setOutputValid] = useState<boolean>(true)
    const [inputValue, setInputValue] = useState<string>("")
    const [outputValue, setOutputValue] = useState<string>("")
    const [inputEnabled, setInputEnabled] = useState<boolean>(false)
    const [inputAddress, setInputAddress] = useState<string>(tokenDropDownList[0].address)
    const [outputAddress, setOutputAddress] = useState<string>(tokenDropDownList[1].address)

    if (inputAddress === outputAddress) {
        setOutputAddress(tokenDropDownList.filter(t => t.address !== inputAddress)[0].address)
    }

    const parsedInputValue = parseFloat(inputValue)
    const parsedOutputValue = parseFloat(outputValue)

    const swapEnabled = inputValid && outputValid && inputEnabled && !isNaN(parsedInputValue) && !isNaN(parsedOutputValue)


    return <Grid
        container
        direction="column"
        justify="space-between"
        alignItems="center"
        spacing={2}>
        <Grid item>
            <ExtendedTextField label="input" dropDownFields={tokenDropDownList}
                valid={inputValid} setValid={setInputValid}
                setValue={setInputValue}
                setEnabled={setInputEnabled}
                setTokenAddress={setInputAddress}
                address={inputAddress}
                value={inputValue} />
        </Grid >
        <Grid item>
            <ArrowDownwardRoundedIcon color="secondary" />
        </Grid>
        <Grid item>
            <ExtendedTextField label="output" dropDownFields={tokenDropDownList}
                valid={outputValid}
                setValid={setOutputValid}
                setValue={setOutputValue}
                setTokenAddress={setOutputAddress}
                address={outputAddress}
                value={outputValue}
            />
        </Grid>
        <Grid item>
            Advanced
        </Grid>
        <Grid item>
            {swapEnabled ? `Swapping ${parsedInputValue} of ${inputAddress} for ${parsedOutputValue} of ${outputAddress}` : 'No Swap'}
        </Grid>
    </Grid >
}