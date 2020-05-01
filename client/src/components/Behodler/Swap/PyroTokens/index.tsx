import * as React from 'react'
import { Grid, Button } from '@material-ui/core'
import { useEffect, useContext, useState } from 'react'
import { WalletContext } from "../../../Contexts/WalletStatusContext"
import ExtendedTextField from "../TradingBox/ExtendedTextField"
import { Images as PyroImages } from './PyroImageLoader'
import { Images as BaseImages } from '../TradingBox/ImageLoader'
import tokenListJSON from "../../../../blockchain/behodlerUI/baseTokens.json"
import API from '../../../../blockchain/ethereumAPI'
import BigNumber from 'bignumber.js'
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';


interface props {

}

const filterPredicate = ((item) => {
    const lower = item.name.toLowerCase()
    switch (lower) {
        case 'scarcity':
        case 'weidai':
        case 'dai':
            return false
        default: return true
    }

})

export default function BaseTokens(props: props) {
    const walletContextProps = useContext(WalletContext)
    const tokenList: any[] = tokenListJSON[walletContextProps.networkName]
    const baseTokenDropDownList = tokenList
        .filter(filterPredicate)
        .map((t, i) => (
            { ...t, image: BaseImages[i] }
        ))

    const pyroTokenDropDownList = baseTokenDropDownList.map((t, i) => (
        { ...t, image: PyroImages[i] }
    ))

    const [pyroTokenValid, setPyroTokenValid] = useState<boolean>(true)
    const [baseTokenValid, setBaseTokenValid] = useState<boolean>(true)
    const [pyroTokenValue, setPyroTokenValue] = useState<string>("")
    const [baseTokenValue, setBaseTokenValue] = useState<string>("")
    const [pyroTokenEnabled, setPyroTokenEnabled] = useState<boolean>(false)
    const [pyroTokenAddress, setPyroTokenAddress] = useState<string>(pyroTokenDropDownList[0].address)
    const [baseTokenAddress, setBaseTokenAddress] = useState<string>(pyroTokenDropDownList[1].address)
    const [redeemClicked, setRedeemClicked] = useState<boolean>(false)
    const [redeemRate, setRedeemRate] = useState<string>("")

    const bigPyroTokenValue = new BigNumber(pyroTokenValue)
    const bigBaseTokenValue = new BigNumber(baseTokenValue)

    const redeemPossible = pyroTokenValid && baseTokenValid && !bigPyroTokenValue.isNaN() && !bigBaseTokenValue.isNaN()
    const pyroTokenReadyToSwap = pyroTokenValid && !bigPyroTokenValue.isNaN()
    const redeemEnabled = redeemPossible && pyroTokenEnabled

    const pyroTokenValWei = pyroTokenValid && !bigPyroTokenValue.isNaN() && bigPyroTokenValue.isGreaterThanOrEqualTo("0") ? API.toWei(pyroTokenValue) : "0"

    const primaryOptions = { from: walletContextProps.account }

    console.log('unused vars' + pyroTokenReadyToSwap + pyroTokenValWei + JSON.stringify(primaryOptions))
    if(3<2)
    setRedeemRate("hello there!")

    useEffect(() => {
        if (redeemClicked) {
            console.log('redeem button clicked')
        }
        setRedeemClicked(false)
    }, [redeemClicked])

    const clearInput = () => { setPyroTokenValue(""); setBaseTokenValue(""); setRedeemClicked(false) }

    return <Grid
        container
        direction="column"
        justify="space-between"
        alignItems="center"
        spacing={3}>
        <Grid item>
            <ExtendedTextField label="PyroToken"
                dropDownFields={pyroTokenDropDownList}
                valid={pyroTokenValid}
                setValid={setPyroTokenValid}
                setValue={setPyroTokenValue}
                setEnabled={setPyroTokenEnabled}
                setTokenAddress={setPyroTokenAddress}
                address={pyroTokenAddress}
                value={pyroTokenValue}
                clear={clearInput}
            />
        </Grid >
        <Grid item>
            <ArrowDownwardIcon color="secondary" />
        </Grid>
        <Grid item>
            <ExtendedTextField label="BaseToken (estimated)"
                dropDownFields={baseTokenDropDownList}
                valid={baseTokenValid}
                setValid={setBaseTokenValid}
                setValue={setBaseTokenValue}
                setTokenAddress={setBaseTokenAddress}
                address={baseTokenAddress}
                value={baseTokenValue}
                exchangeRate={{ inputAddress: pyroTokenAddress, ratio: redeemRate, valid: redeemEnabled }}
                clear={clearInput}
                disabledInput
            />
        </Grid>
        {redeemEnabled ?
            <Grid item>
                <Button variant="contained" color="primary" onClick={() => setRedeemClicked(true)}>REDEEM</Button>
            </Grid>
            : ""}
    </Grid >
}
