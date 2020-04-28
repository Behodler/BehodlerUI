import * as React from 'react'
import { useEffect, useCallback } from 'react'
import ExtendedTextField from "./ExtendedTextField"
import { Grid, Button, IconButton } from '@material-ui/core'
import { useContext, useState } from 'react'
import tokenListJSON from "../../../../blockchain/behodlerUI/baseTokens.json"
import { WalletContext } from "../../../Contexts/WalletStatusContext"
import { Images } from './ImageLoader'
import SwapVertIcon from '@material-ui/icons/SwapVert';
import BigNumber from 'bignumber.js'
import API from '../../../../blockchain/ethereumAPI'

interface props {
}

export default function TradeBox(props: props) {
    BigNumber.config({ EXPONENTIAL_AT: 50, DECIMAL_PLACES: 18 })

    const walletContextProps = useContext(WalletContext)

    const tokenList: any[] = tokenListJSON[walletContextProps.networkName]
    const indexOfWeth = tokenList.findIndex(item => item.name.toLowerCase().indexOf('weth') !== -1)

    let tokenDropDownList = tokenList.map((t, i) => {
        let item = { ...t, image: Images[i] }
        if (i === indexOfWeth) {
            item.name = "Eth"
        }
        return item
    })

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
    const scarcityAddress = tokenDropDownList.filter(t => t.name === 'Scarcity')[0].address.toLowerCase()
    if (inputAddress === outputAddress) {
        setOutputAddress(tokenDropDownList.filter(t => t.address !== inputAddress)[0].address)
    }

    const swapInputAddresses = () => {
        const temp = inputAddress
        setInputAddress(outputAddress)
        setOutputAddress(temp)
    }

    const parsedInputValue = parseFloat(inputValue)
    const parsedOutputValue = parseFloat(outputValue)

    const swapPossible = inputValid && outputValid && !isNaN(parsedInputValue) && !isNaN(parsedOutputValue)
    const inputReadyToSwap = inputValid && !isNaN(parsedInputValue)
    const swapEnabled = swapPossible && inputEnabled

    const inputValWei = inputValid && !isNaN(parsedInputValue) ? API.toWei(inputValue) : "0"

    const primaryOptions = { from: walletContextProps.account }

    const isEthPredicate = (textBoxAddress: string): boolean => {
        return tokenDropDownList.filter(item => item.address.trim().toLowerCase() === textBoxAddress.trim().toLowerCase())[0].name === 'Eth'
    }

    const swapCallBack = useCallback(async () => {
        if (swapClicked) {
            setSwapClicked(false)
            if (isEthPredicate(inputAddress)) {
                console.log('input is eth')
                const behodlerAddress = walletContextProps.contracts.behodler.Behodler.address
                walletContextProps.contracts.behodler.Weth.allowance(walletContextProps.account, behodlerAddress).call(primaryOptions)
                    .then(behodlerAllowance => {
                        if (new BigNumber(behodlerAllowance).isLessThan(new BigNumber(inputValWei))) {
                            console.log('approving behodler')
                            walletContextProps.contracts.behodler.Weth.approve(behodlerAddress, API.UINTMAX).send(primaryOptions, () => {
                                console.log('approved')
                                walletContextProps.contracts.behodler.Janus.ethToToken(outputAddress, "0", "0").send({ from: walletContextProps.account, value: inputValWei }, () => {
                                    clearInput();
                                });
                            })
                        }
                        else {
                            console.log('no need to approve')
                            walletContextProps.contracts.behodler.Janus.ethToToken(outputAddress, "0", "0").send({ from: walletContextProps.account, value: inputValWei }, () => {
                                clearInput();
                            });
                        }
                    })
            }
            else if (isEthPredicate(outputAddress)) {
                console.log('output is eth')
                const janusAddress = walletContextProps.contracts.behodler.Janus.address
                walletContextProps.contracts.behodler.Weth.allowance(walletContextProps.account, janusAddress).call(primaryOptions)
                    .then(jAllowance => {
                        const outputValWei = API.toWei(outputValue)
                        if (new BigNumber(jAllowance).isLessThan(new BigNumber(outputValWei))) {

                            walletContextProps.contracts.behodler.Weth.approve(janusAddress, API.UINTMAX).send(primaryOptions, () => {
                                console.log('approved')
                                walletContextProps.contracts.behodler.Janus.tokenToEth(inputAddress, inputValWei, "0", "0").send(primaryOptions, () => {
                                    clearInput();
                                });
                            })
                        } else {
                            console.log('regular janus stuff')
                            walletContextProps.contracts.behodler.Janus.tokenToEth(inputAddress, inputValWei, "0", "0").send(primaryOptions, () => {
                                clearInput();
                            });
                        }
                    })
            } else {
                walletContextProps.contracts.behodler.Janus.tokenToToken(inputAddress, outputAddress, inputValWei, "0", "0").send(primaryOptions, () => {
                    clearInput();
                });
            }
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
            <ExtendedTextField label="Input" dropDownFields={tokenDropDownList}
                valid={inputValid}
                setValid={setInputValid}
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
            <IconButton aria-label="delete" onClick={swapInputAddresses}>
                <SwapVertIcon color="secondary" />
            </IconButton>
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