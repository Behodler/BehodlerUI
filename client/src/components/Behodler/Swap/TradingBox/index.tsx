import * as React from 'react'
import { useEffect, useCallback, useState, useContext } from 'react'
import ExtendedTextField from "./ExtendedTextField"
import { Grid, Button, IconButton } from '@material-ui/core'
import tokenListJSON from "../../../../blockchain/behodlerUI/baseTokens.json"
import { WalletContext } from "../../../Contexts/WalletStatusContext"
import { Images } from './ImageLoader'
import SwapVertIcon from '@material-ui/icons/SwapVert';
import BigNumber from 'bignumber.js'
import API from '../../../../blockchain/ethereumAPI'
import AdvancedDetails, { configuration } from './AdvancedDetails'

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

    const bigNumberLessThanOrEqual = (lhs: string, rhs: string): boolean => {
        const lhsBig = new BigNumber(lhs)
        const rhsBig = new BigNumber(rhs)

        return !lhsBig.isNaN() && !rhsBig.isNaN() && new BigNumber(lhs).isLessThanOrEqualTo(new BigNumber(rhs))
    }

    const [inputValid, setInputValid] = useState<boolean>(true)
    const [outputValid, setOutputValid] = useState<boolean>(true)
    const [inputValue, setInputValue] = useState<string>("")
    const [outputValue, setOutputValue] = useState<string>("")
    const [inputEnabled, setInputEnabled] = useState<boolean>(false)
    const [inputAddress, setInputAddress] = useState<string>(tokenDropDownList[0].address)
    const [outputAddress, setOutputAddress] = useState<string>(tokenDropDownList[1].address)
    const [exchangeRate, setExchangeRate] = useState<string>("")
    const [swapClicked, setSwapClicked] = useState<boolean>(false)
    const [dryRunSCX, setDryRunSCX] = useState<string>("")
    const [dryRunTokens, setDryRunTokens] = useState<string>("")
    const [showAdvanced, setShowAdvanced] = useState<boolean>(false)
    const [minPrice, setMinPrice] = useState<string>("0")
    const [maxPrice, setMaxPrice] = useState<string>("0")
    const [fee, setFee] = useState<string>("0")
    const [reward, setReward] = useState<string>("0")
    const [outputReserve, setOutputReserve] = useState<string>("")

    const correctPrice = (price: string) => {
        if (new BigNumber(price).isNaN())
            return '0'
        return API.toWei(price)
    }
    const nameOfSelectedAddress = (address: string) => tokenDropDownList.filter(t => t.address == address)[0].name
    const clearInput = () => { setInputValue(""); setOutputValue(""); setShowAdvancedAndSetPrices(false); setMinPrice("0"); setMaxPrice("0"); setSwapClicked(false) }
    const scarcityAddress = tokenDropDownList.filter(t => t.name === 'Scarcity')[0].address.toLowerCase().trim()
    if (inputAddress === outputAddress) {
        setOutputAddress(tokenDropDownList.filter(t => t.address !== inputAddress)[0].address)
    }
    let advancedConfig: configuration = configuration.TOKENTOTOKEN
    if (inputAddress.toLowerCase().trim() === scarcityAddress) {
        advancedConfig = configuration.SCARCITYIN
    } else if (outputAddress.toLowerCase().trim() === scarcityAddress) {
        advancedConfig = configuration.SCARCITYOUT
    }

    const swapInputAddresses = () => {
        const temp = inputAddress
        setInputAddress(outputAddress)
        setOutputAddress(temp)
        clearInput()
    }

    const setDefaultMinMaxPrice = () => {
        const outputValWei = API.toWei(outputValue)
        const minPrice = new BigNumber(dryRunSCX).dividedBy(new BigNumber(inputValWei)).times(0.9).toString()
        const maxPrice = new BigNumber(dryRunSCX).dividedBy(new BigNumber(outputValWei)).times(1.1).toString()
        setMinPrice(minPrice)
        setMaxPrice(maxPrice)
        return [minPrice, maxPrice]
    }

    const setShowAdvancedAndSetPrices = (show: boolean) => {
        if (showAdvanced !== show && swapEnabled) { //set default min and max prices
            setDefaultMinMaxPrice()
        }
        setShowAdvanced(show)
    }

    const bigInputValue = new BigNumber(inputValue)
    const bigOutputValue = new BigNumber(outputValue)

    const swapPossible = inputValid && outputValid && !bigInputValue.isNaN() && !bigOutputValue.isNaN()
    const inputReadyToSwap = inputValid && !bigInputValue.isNaN()
    const swapEnabled = swapPossible && inputEnabled

    const wbtcOverride = nameOfSelectedAddress(inputAddress).toLowerCase().trim() === 'wbtc' ? 8 : 18

    const inputValWei = inputValid && !bigInputValue.isNaN() && bigInputValue.isGreaterThanOrEqualTo("0") ? API.toWei(inputValue, wbtcOverride) : "0"

    const primaryOptions = { from: walletContextProps.account }
    const highGasOptions = { from: walletContextProps.account }

    const isEthPredicate = (textBoxAddress: string): boolean => {
        return tokenDropDownList.filter(item => item.address.trim().toLowerCase() === textBoxAddress.trim().toLowerCase())[0].name === 'Eth'
    }

    const swapCallBack = useCallback(async () => {
        if (swapClicked) {
            let priceSet = [minPrice, maxPrice]
            if (!showAdvanced)
                priceSet = setDefaultMinMaxPrice()

            setSwapClicked(false)
            if (isEthPredicate(inputAddress)) {
                const behodlerAddress = walletContextProps.contracts.behodler.Behodler.address
                walletContextProps.contracts.behodler.Weth.allowance(walletContextProps.account, behodlerAddress).call(primaryOptions)
                    .then(behodlerAllowance => {
                        if (new BigNumber(behodlerAllowance).isLessThan(new BigNumber(inputValWei))) {

                            walletContextProps.contracts.behodler.Weth.approve(behodlerAddress, API.UINTMAX).send(primaryOptions, () => {
                                clearInput();
                                walletContextProps.contracts.behodler.Janus.ethToToken(outputAddress, correctPrice(priceSet[0]), correctPrice(priceSet[1])).send({ from: walletContextProps.account, value: inputValWei }, () => {

                                });
                            })
                        }
                        else {
                            walletContextProps.contracts.behodler.Janus.ethToToken(outputAddress, correctPrice(priceSet[0]), correctPrice(priceSet[1])).send({ from: walletContextProps.account, value: inputValWei }, () => {
                                clearInput();
                            });
                        }
                    })
            }
            else if (isEthPredicate(outputAddress)) {
                const janusAddress = walletContextProps.contracts.behodler.Janus.address
                walletContextProps.contracts.behodler.Weth.allowance(walletContextProps.account, janusAddress).call(primaryOptions)
                    .then(jAllowance => {
                        const outputValWei = API.toWei(outputValue)
                        if (new BigNumber(jAllowance).isLessThan(new BigNumber(outputValWei))) {

                            walletContextProps.contracts.behodler.Weth.approve(janusAddress, API.UINTMAX).send(primaryOptions, () => {
                                walletContextProps.contracts.behodler.Janus.tokenToEth(inputAddress, inputValWei, correctPrice(priceSet[0]), correctPrice(priceSet[1])).send(primaryOptions, () => {
                                    clearInput();
                                });
                            })
                        } else {
                            walletContextProps.contracts.behodler.Janus.tokenToEth(inputAddress, inputValWei, correctPrice(priceSet[0]), correctPrice(priceSet[1])).send(primaryOptions, (err) => {
                                clearInput();
                            });
                        }
                    })
            } else {
                walletContextProps.contracts.behodler.Janus.tokenToToken(inputAddress, outputAddress, inputValWei, correctPrice(priceSet[0]), correctPrice(priceSet[1])).send(primaryOptions, (err) => {
                    clearInput();
                });
            }
        }
        setSwapClicked(false)
    }, [swapClicked])

    useEffect(() => {
        swapCallBack()
    }, [swapClicked])

    useEffect(() => {
        if (inputReadyToSwap) {
            const nameOfInput = nameOfSelectedAddress(inputAddress).toLowerCase()

            walletContextProps.contracts.behodler.Kharon.toll(inputAddress, inputValWei).call(primaryOptions)
                .then(feeResult => {
                    const decimalFee = API.hexToNumberString(feeResult)
                    if (!new BigNumber(decimalFee).isNaN())
                        setFee(API.fromWei(decimalFee, wbtcOverride))
                    if (nameOfInput === 'scarcity' || nameOfInput === 'weidai' || nameOfInput === 'dai')
                        setReward("")
                    else
                        walletContextProps.contracts.behodler.Kharon.demandPaymentRewardDryRun(inputAddress, inputValWei)
                            .call(primaryOptions)
                            .then(rewardResult => {

                                const decimalReward = API.hexToNumberString(rewardResult)
                                if (!new BigNumber(decimalReward).isNaN()) {
                                    setReward(API.fromWei(decimalReward, wbtcOverride))
                                    setFee(API.fromWei(new BigNumber(decimalFee).minus(decimalReward).toString(), wbtcOverride))
                                }
                            })
                })

            if (inputAddress.toLowerCase() === scarcityAddress) {
                walletContextProps.contracts.behodler.Behodler.tokenScarcityObligations(outputAddress)
                    .call(primaryOptions)
                    .then(obligations => {
                        if (new BigNumber(obligations).isLessThan(new BigNumber(inputValWei))) {
                            setInputValue(API.fromWei(obligations.toString()))
                            return;
                        }
                        walletContextProps.contracts.behodler.Behodler.sellDryRun(outputAddress, inputValWei, correctPrice(maxPrice))
                            .call(highGasOptions)
                            .then(tokensToPurchase => {
                                setDryRunTokens(tokensToPurchase)
                                const ex = new BigNumber(tokensToPurchase).dividedBy(inputValWei)
                                setExchangeRate(ex.toString())
                                const wbtcOutputOverride = nameOfSelectedAddress(outputAddress).toLowerCase().trim() === 'wbtc' ? 8 : 18
                                setOutputValue(API.fromWei(tokensToPurchase.toString(), wbtcOutputOverride))
                            })
                            .catch(error => {
                            })
                    })


            } else if (outputAddress.toLowerCase() === scarcityAddress) {
                walletContextProps.contracts.behodler.Behodler.buyDryRun(inputAddress, inputValWei, correctPrice(minPrice))
                    .call(highGasOptions)
                    .then(scxToPurchase => {
                        setDryRunSCX(scxToPurchase)
                        const ex = new BigNumber(scxToPurchase).dividedBy(inputValWei)
                        setExchangeRate(ex.toString())
                        setOutputValue(API.fromWei(scxToPurchase.toString(), wbtcOverride))
                    })
                    .catch(err => {
                    })

            }
            else {
                walletContextProps.contracts.behodler.Behodler.buyDryRun(inputAddress, inputValWei, correctPrice(minPrice))
                    .call(highGasOptions)
                    .then(scxToPurchase => {
                        setDryRunSCX(scxToPurchase)
                        walletContextProps.contracts.behodler.Behodler.sellDryRun(outputAddress, scxToPurchase, correctPrice(maxPrice))
                            .call(highGasOptions)
                            .then(tokensToPurchase => {
                                setDryRunTokens(tokensToPurchase)
                                const ex = new BigNumber(tokensToPurchase).dividedBy(inputValWei)
                                setExchangeRate(ex.toString())
                                const wbtcOutputOverride = nameOfSelectedAddress(outputAddress).toLowerCase().trim() === 'wbtc' ? 8 : 18
                                const tokensToPurchaseEth = API.fromWei(tokensToPurchase.toString(), wbtcOutputOverride)
                                if (bigNumberLessThanOrEqual(tokensToPurchaseEth, outputReserve)) {
                                    setOutputValue(tokensToPurchaseEth)
                                    setOutputValid(true)
                                }
                                else {
                                    setOutputValue('Insufficient Reserve')
                                    setOutputValid(false)
                                }
                            })
                            .catch(err => {
                                setInputValid(false)
                            })
                    })
            }

        }
    }, [inputReadyToSwap, inputValue])

    const feeRewardBreakdown = swapEnabled ? {
        fee,
        reward: reward !== '' ? reward : undefined,
        donation: '0'
    } : undefined

    return <Grid
        container
        direction="column"
        justify="space-between"
        alignItems="center"
        spacing={3}>
        <Grid item>
            <ExtendedTextField label="Input"
                dropDownFields={tokenDropDownList}
                valid={inputValid}
                setValid={setInputValid}
                setValue={setInputValue}
                setEnabled={setInputEnabled}
                setTokenAddress={setInputAddress}
                address={inputAddress}
                value={inputValue}
                scarcityAddress={scarcityAddress}
                clear={clearInput}
                feeReward={feeRewardBreakdown}
            />
        </Grid >
        <Grid item>
            <IconButton aria-label="delete" onClick={swapInputAddresses}>
                <SwapVertIcon color="secondary" />
            </IconButton>
        </Grid>
        <Grid item>
            <ExtendedTextField label="Output (estimated)"
                dropDownFields={tokenDropDownList}
                valid={outputValid}
                setValid={setOutputValid}
                setValue={setOutputValue}
                setTokenAddress={setOutputAddress}
                address={outputAddress}
                value={outputValue}
                exchangeRate={{ baseAddress: inputAddress, baseName: nameOfSelectedAddress(inputAddress), ratio: exchangeRate, valid: swapEnabled, reserve: outputReserve, setReserve: setOutputReserve }}
                clear={clearInput}
                disabledInput
            />
        </Grid>{swapEnabled ?
            <Grid item>
                {showAdvanced ? <Grid
                    container
                    direction="column"
                    justify="center"
                    alignItems="center"
                >
                    <Grid item>
                        <AdvancedDetails setMaxPrice={setMaxPrice}
                            setMinPrice={setMinPrice}
                            nameOfInput={nameOfSelectedAddress(inputAddress)}
                            nameOfOutput={nameOfSelectedAddress(outputAddress)}
                            inputValue={inputValue}
                            outputValue={outputValue}
                            DryRunSCX={dryRunSCX}
                            DryRunTokens={dryRunTokens}
                            configuration={advancedConfig}
                            minPrice={minPrice}
                            maxPrice={maxPrice}
                        />
                    </Grid>
                    <Grid item>
                        <Button color="secondary" onClick={() => { setShowAdvancedAndSetPrices(false); setMinPrice("0"); setMaxPrice("0") }}>Hide Advanced</Button>
                    </Grid>
                </Grid> :
                    <Button color="secondary" onClick={() => setShowAdvancedAndSetPrices(true)}>Show Advanced</Button>}
            </Grid>
            : ""}
        {swapEnabled ?
            <Grid item>
                <Button variant="contained" color="primary" onClick={() => setSwapClicked(true)}>SWAP</Button>
            </Grid>
            : ""}
    </Grid >
}