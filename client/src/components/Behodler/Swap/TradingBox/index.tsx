import * as React from 'react'
import { useEffect, useCallback } from 'react'
import ExtendedTextField from "./ExtendedTextField"
import { Grid, Button } from '@material-ui/core'
import { useContext, useState } from 'react'
import tokenListJSON from "../../../../blockchain/behodlerUI/baseTokens.json"
import { WalletContext } from "../../../Contexts/WalletStatusContext"
import ArrowDownwardRoundedIcon from '@material-ui/icons/ArrowDownwardRounded';
import { Images } from './ImageLoader'
// import { AverageScarcityPerToken, AverageTokenPerScarcity, BuyDryRunProducer, SellDryRunProducer } from '../../../../blockchain/behodlerUI/TradeCalculations'
import baseTokenJSON from '../../../../blockchain/behodlerUI/baseTokens.json'
import BigNumber from 'bignumber.js'
import API from '../../../../blockchain/ethereumAPI'

interface props {
}

export default function TradeBox(props: props) {
    BigNumber.config({ EXPONENTIAL_AT: 50, DECIMAL_PLACES: 18 })

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
    const [exchangeRate, setExchangeRate] = useState<string>("")
    const [swapClicked, setSwapClicked] = useState<boolean>(false)

    const clearInput = () => { setInputValue(""); setOutputValue("") }

    const scarcityAddress = baseTokenJSON[walletContextProps.networkName].filter(t => t.name === 'Scarcity')[0].address.toLowerCase()

    if (inputAddress === outputAddress) {
        setOutputAddress(tokenDropDownList.filter(t => t.address !== inputAddress)[0].address)
    }

    const parsedInputValue = parseFloat(inputValue)
    const parsedOutputValue = parseFloat(outputValue)

    const swapPossible = inputValid && outputValid && !isNaN(parsedInputValue) && !isNaN(parsedOutputValue)
    const inputReadyToSwap = inputValid && !isNaN(parsedInputValue)
    const swapEnabled = swapPossible && inputEnabled

    const inputValWei = inputValid && !isNaN(parsedInputValue) ? API.toWei(inputValue) : "0"

    const primaryOptions = { from: walletContextProps.account }

    const swapCallBack = useCallback(async () => {
        if (swapClicked) {
            setSwapClicked(false)
            await walletContextProps.contracts.behodler.Janus.tokenToToken(inputAddress, outputAddress, inputValWei, "0", "0").send(primaryOptions, () => {
                clearInput();
            });
        }
        setSwapClicked(false)
    }, [swapClicked, inputAddress, outputAddress, inputValWei, primaryOptions])

    useEffect(() => {
        swapCallBack()
    }, [swapClicked])


    useEffect(() => {
        if (inputReadyToSwap) {
            if (inputAddress.toLowerCase() === scarcityAddress) {
                walletContextProps.contracts.behodler.Behodler.tokenScarcityObligations(outputAddress)
                    .call(primaryOptions)
                    .then(obligations => {
                        if (new BigNumber(obligations).isLessThan(new BigNumber(inputValWei))) {
                            setInputValue(API.fromWei(obligations.toString()))
                            return;
                        }
                        walletContextProps.contracts.behodler.Behodler.sellDryRun(outputAddress, inputValWei, "0")
                            .call(primaryOptions)
                            .then(tokensToPurchase => {
                                const ex = new BigNumber(tokensToPurchase).dividedBy(inputValWei)
                                setExchangeRate(ex.toString())
                                setOutputValue(API.fromWei(tokensToPurchase.toString()))
                            })
                            .catch(error => {
                                console.log('caught error: ' + error)
                            })
                    })


            } else if (outputAddress.toLowerCase() === scarcityAddress) {
                walletContextProps.contracts.behodler.Behodler.buyDryRun(inputAddress, inputValWei, "0")
                    .call(primaryOptions)
                    .then(scxToPurchase => {
                        const ex = new BigNumber(scxToPurchase).dividedBy(inputValWei)
                        setExchangeRate(ex.toString())
                        setOutputValue(API.fromWei(scxToPurchase.toString()))
                    })
                    .catch(error => {
                        console.log('caught error: ' + error)
                    })

            }
            else {
                walletContextProps.contracts.behodler.Behodler.buyDryRun(inputAddress, inputValWei, "0")
                    .call(primaryOptions)
                    .then(scxToPurchase => {
                        walletContextProps.contracts.behodler.Behodler.sellDryRun(outputAddress, scxToPurchase, "0")
                            .call(primaryOptions)
                            .then(tokensToPurchase => {
                                const ex = new BigNumber(tokensToPurchase).dividedBy(inputValWei)
                                setExchangeRate(ex.toString())
                                setOutputValue(API.fromWei(tokensToPurchase.toString()))
                            })
                    })
            }

        }
    })

    return <Grid
        container
        direction="column"
        justify="space-between"
        alignItems="center"
        spacing={2}>
        <Grid item>
            <ExtendedTextField label="Input (estimated)" dropDownFields={tokenDropDownList}
                valid={inputValid} setValid={setInputValid}
                setValue={setInputValue}
                setEnabled={setInputEnabled}
                setTokenAddress={setInputAddress}
                address={inputAddress}
                value={inputValue}
                scarcityAddress={scarcityAddress}
                clear={clearInput}
            />
        </Grid >
        <Grid item>
            <ArrowDownwardRoundedIcon color="secondary" />
        </Grid>
        <Grid item>
            <ExtendedTextField label="Output (estimated)" dropDownFields={tokenDropDownList}
                valid={outputValid}
                setValid={setOutputValid}
                setValue={setOutputValue}
                setTokenAddress={setOutputAddress}
                address={outputAddress}
                value={outputValue}
                exchangeRate={{ inputAddress, ratio: exchangeRate, valid: swapEnabled }}
                clear={clearInput}
            />
        </Grid>
        <Grid item>
            Advanced
        </Grid>

        {swapEnabled ?
            <Grid item>
                <Button variant="contained" color="primary" onClick={() => setSwapClicked(true)}>SWAP</Button>
            </Grid>
            : <Grid item>No Swap</Grid>}
    </Grid >
}