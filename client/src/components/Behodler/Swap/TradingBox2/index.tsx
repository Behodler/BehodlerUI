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

interface props {
}

export default function TradeBox2(props: props) {
    BigNumber.config({ EXPONENTIAL_AT: 50, DECIMAL_PLACES: 18 })
    const walletContextProps = useContext(WalletContext)
    const tokenList: any[] = tokenListJSON[walletContextProps.networkName].filter(t => t.name !== 'WBTC')
    const indexOfWeth = tokenList.findIndex(item => item.name.toLowerCase().indexOf('weth') !== -1)
    const indexOfScarcityAddress = tokenList.findIndex(item => item.name.toLowerCase().indexOf('scarcity') !== -1)
    const behodler2Weth = walletContextProps.contracts.behodler.Behodler2.Weth10.address

    let tokenDropDownList = tokenList.map((t, i) => {
        let item = { ...t, image: Images[i] }
        if (i === indexOfWeth) {
            item.name = "Eth"
            item.address = behodler2Weth
        }
        if (i === indexOfScarcityAddress) {
            item.address = walletContextProps.contracts.behodler.Behodler2.Behodler2.address
        }
        return item
    })
    const scarcityAddress = tokenDropDownList.filter(t => t.name === 'Scarcity')[0].address.toLowerCase().trim()

    const [inputValid, setInputValid] = useState<boolean>(true)
    const [outputValid, setOutputValid] = useState<boolean>(true)
    const [inputValue, setInputValue] = useState<string>("")
    const [outputValue, setOutputValue] = useState<string>("")
    const [outputValueWei, setOutputValueWei] = useState<string>("")

    const [inputEnabled, setInputEnabled] = useState<boolean>(false)
    const [inputAddress, setInputAddress] = useState<string>(tokenDropDownList[0].address)
    const [outputAddress, setOutputAddress] = useState<string>(tokenDropDownList[indexOfScarcityAddress].address)
    const [inputDecimals, setInputDecimals] = useState<number>(18)
    const [outputDecimals, setOutputDecimals] = useState<number>(18)
    
    useEffect(() => {
        API.getTokenDecimals(inputAddress)
            .then(setInputDecimals)
    }, [inputAddress])

    useEffect(() => {
        API.getTokenDecimals(outputAddress)
            .then(setOutputDecimals)
    }, [outputAddress])

    if (tokenDropDownList.filter(t => t.address === outputAddress).length === 0) {
        setOutputAddress(tokenDropDownList[1])
    }
    if (tokenDropDownList.filter(t => t.address === inputAddress).length === 0) {
        setInputAddress(tokenDropDownList[0])
    }
    const [exchangeRate, setExchangeRate] = useState<string>("")
    const [swapClicked, setSwapClicked] = useState<boolean>(false)

    const [outputReserve, setOutputReserve] = useState<string>("")
    const nameOfSelectedAddress = (address: string) => tokenDropDownList.filter(t => t.address == address)[0].name
    const clearInput = () => { setInputValue(""); setOutputValue(""); setSwapClicked(false) }

    if (inputAddress === outputAddress) {
        setOutputAddress(tokenDropDownList.filter(t => t.address !== inputAddress)[0].address)
    }

    const swapInputAddresses = () => {
        const temp = inputAddress
        setInputAddress(outputAddress)
        setOutputAddress(temp)
        clearInput()
    }

    const bigInputValue = new BigNumber(inputValue)
    const bigOutputValue = new BigNumber(outputValue)

    const swapPossible = inputValid && outputValid && !bigInputValue.isNaN() && !bigOutputValue.isNaN()
    const inputReadyToSwap = inputValid && !bigInputValue.isNaN()



    const swapEnabled = swapPossible && inputEnabled

    const inputValWei = inputValid && !bigInputValue.isNaN() && bigInputValue.isGreaterThanOrEqualTo("0") ? API.toWei(inputValue, inputDecimals) : "0"

    const primaryOptions = { from: walletContextProps.account }
    const ethOptions = { from: walletContextProps.account, value: inputValWei, gas: "200000" }

    const isTokenPredicateFactory = (tokenName: string) => (address: string): boolean => tokenDropDownList.filter(item => item.address.trim().toLowerCase() === address.trim().toLowerCase())[0].name === tokenName
    const isEthPredicate = isTokenPredicateFactory('Eth')
    const isScarcityPredicate = isTokenPredicateFactory('Scarcity')
    const behodler = walletContextProps.contracts.behodler.Behodler2.Behodler2
    let swapText = 'SWAP'

    if (isScarcityPredicate(outputAddress)) {
        swapText = 'ADD LIQUIDITY'
    }
    else if (isScarcityPredicate(inputAddress)) {
        swapText = 'WITHDRAW LIQUIDITY'
    }

    const swap2Callback = useCallback(async () => {
        if (swapClicked) {
            if (inputAddress.toLowerCase() === scarcityAddress) {
                behodler.withdrawLiquidity(outputAddress, outputValueWei).send(primaryOptions, clearInput)
            } else if (outputAddress.toLowerCase() === scarcityAddress) {
                behodler.addLiquidity(inputAddress, inputValWei).send(isEthPredicate(inputAddress) ? ethOptions : primaryOptions, clearInput)
            } else {
                behodler.swap(inputAddress, outputAddress, inputValWei, outputValueWei).send(isEthPredicate(inputAddress) ? ethOptions : primaryOptions, clearInput)
            }
        }
        setSwapClicked(false)
    }, [swapClicked])

    useEffect(() => {
        if (swapClicked) {
            swap2Callback();
        }
    }, [swapClicked])

    const setTerms = (i: string, o: string) => {
        const iBig = new BigNumber(i)
        const oBig = new BigNumber(o)
        setExchangeRate(oBig.dividedBy(iBig).toString())
    }

    const validateLiquidityExit = async (tokensToWithdraw: BigNumber) => {
        const maxLiquidityExit = new BigNumber((await behodler.getMaxLiquidityExit().call(primaryOptions)).toString())
        const O_i = await API.getTokenBalance(outputAddress, behodler.address, false, outputDecimals)
        const exitRatio = new BigNumber(tokensToWithdraw.times(100).div(O_i.toString()).toFixed(0).toString())
        if (exitRatio.isGreaterThan(maxLiquidityExit)) {
            setInputValid(false)
        }
    }
    const swapPreparationCallback = useCallback(async () => {
        if (inputReadyToSwap) {
            //if input is scx, figure out tokensToRelease
            //if output is scx, nothing to figure out
            //if swap, set output Val
            if (isScarcityPredicate(inputAddress)) {//withdraw liquidity
                //ΔSCX = log(Initial) - log(Final)
                //log(FinalBalance) =  log(InitialBalance) - ΔSCX 
                //let X = log(InitialBalance) - ΔSCX 
                //FinalBalance = 2^X

                const O_i = new BigNumber(await API.getTokenBalance(outputAddress, behodler.address, false, outputDecimals))
                const guess = O_i.div(2).toFixed(0);
                const actual = new BigNumber((await behodler.withdrawLiquidityFindSCX(outputAddress, guess.toString(), inputValWei, "15").call(primaryOptions)).toString())
                await validateLiquidityExit(actual)

                const actualString = actual.toString()
                setOutputValueWei(actualString)
                setOutputValue(API.fromWei(actualString))
                setTerms(inputValWei, actualString)

            } else if (isScarcityPredicate(outputAddress)) { //add liquidity

                const scx = await behodler.addLiquidity(inputAddress, inputValWei).call(isEthPredicate(inputAddress) ? ethOptions : primaryOptions)
                const scxString = scx.toString()
                setOutputValueWei(scxString)
                setOutputValue(API.fromWei(scxString))
                setTerms(inputValWei, scxString)
            }
            else {
                // I_f/I_i = O_i/O_f
                const I_i = new BigNumber(await API.getTokenBalance(inputAddress, behodler.address, false, inputDecimals))
                const burnFee = (await behodler.getConfiguration().call(primaryOptions))[1]
                const netAmount = new BigNumber(inputValWei).minus(burnFee.mul(inputValWei).div(1000))
                const I_f = I_i.plus(netAmount)

                const O_i = new BigNumber(await API.getTokenBalance(outputAddress, behodler.address, false, outputDecimals))
                const O_f = O_i.times(I_i.div(I_f))
                let outputWei = O_i.minus(O_f).toString()
                const indexOfPoint = outputWei.indexOf('.')
                outputWei = indexOfPoint === -1 ? outputWei : outputWei.substring(0, indexOfPoint)
                await validateLiquidityExit(new BigNumber(outputWei))
                setOutputValueWei(outputWei)
                setOutputValue(API.fromWei(outputWei))
                setTerms(inputValWei, outputWei)
            }
        }
    }, [inputReadyToSwap, inputValue])

    useEffect(() => {
        if (inputReadyToSwap) {
            swapPreparationCallback();
        }
    }, [inputReadyToSwap, inputValue])

    const textFieldLabels = ['From', 'To']
    return <Grid
        container
        direction="column"
        justify="space-between"
        alignItems="center"
        spacing={3}>
        <Grid item>
            <ExtendedTextField label={textFieldLabels[0]}
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
                addressToEnableFor={walletContextProps.contracts.behodler.Behodler2.Behodler2.address}
                decimalPlaces={inputDecimals}
            />
        </Grid >
        <Grid item>
            <IconButton aria-label="delete" onClick={swapInputAddresses}>
                <SwapVertIcon color="secondary" />
            </IconButton>
        </Grid>
        <Grid item>
            <ExtendedTextField label={textFieldLabels[1]}
                dropDownFields={tokenDropDownList}
                valid={outputValid}
                setValid={setOutputValid}
                setValue={setOutputValue}
                setTokenAddress={setOutputAddress}
                address={outputAddress}
                value={outputValue}
                disabledInput
                exchangeRate={{ baseAddress: inputAddress, baseName: nameOfSelectedAddress(inputAddress), ratio: exchangeRate, valid: swapEnabled, reserve: outputReserve, setReserve: setOutputReserve }}
                clear={clearInput}
                decimalPlaces={outputDecimals}
            />
        </Grid>
        {swapEnabled ?
            <Grid item>
                <Button variant="contained" color="primary" onClick={() => setSwapClicked(true)}>{swapText}</Button>
            </Grid>
            : ""}
    </Grid >
}