import * as React from 'react'
import { useEffect, useCallback, useState, useContext } from 'react'
import ExtendedTextField from './ExtendedTextField'
import { Button, IconButton, Box, makeStyles, Theme } from '@material-ui/core'
import tokenListJSON from '../../../../blockchain/behodlerUI/baseTokens.json'
import { WalletContext } from '../../../Contexts/WalletStatusContext'
import { Images } from './ImageLoader'
import SwapVertIcon from '@material-ui/icons/SwapVert'
import BigNumber from 'bignumber.js'
import API from '../../../../blockchain/ethereumAPI'

interface props { }

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        boxSizing: 'border-box',
        margin: '50px auto',
        maxWidth: '480px',
        padding: '40px 20px',
        backgroundColor: 'rgba(255,255,255,0.93)',
        borderRadius: 20,
        width: '90%',
        boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19)',
    },
    iconWrapper: {
        display: 'flex',
        justifyContent: 'center',
        margin: '24px 0',
    },
    buttonWrapper: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: 36,
    },
}))

export default function TradeBox2(props: props) {
    const classes = useStyles();
    BigNumber.config({ EXPONENTIAL_AT: 50, DECIMAL_PLACES: 18 });
    const walletContextProps = useContext(WalletContext);
    const tokenList: any[] = tokenListJSON[walletContextProps.networkName].filter(
        (t) => t.name !== "WBTC" && t.name !== "BAT"
    );
    const indexOfWeth = tokenList.findIndex((item) => item.name.toLowerCase().indexOf("weth") !== -1);
    const indexOfScarcityAddress = tokenList.findIndex((item) => item.name.toLowerCase().indexOf("scarcity") !== -1);
    const behodler2Weth = walletContextProps.contracts.behodler.Behodler2.Weth10.address;

    let tokenDropDownList = tokenList.map((t, i) => {
        let item = { ...t, image: Images[i] }
        if (i === indexOfWeth) {
            item.name = 'Eth'
            item.address = behodler2Weth
        }
        if (i === indexOfScarcityAddress) {
            item.address = walletContextProps.contracts.behodler.Behodler2.Behodler2.address
        }
        return item
    })
    const scarcityAddress = tokenDropDownList
        .filter((t) => t.name === 'Scarcity')[0]
        .address.toLowerCase()
        .trim()

    const [inputValid, setInputValid] = useState<boolean>(true)
    const [outputValid, setOutputValid] = useState<boolean>(true)
    const [inputValue, setInputValue] = useState<string>('')
    const [outputValue, setOutputValue] = useState<string>('')
    const [outputValueWei, setOutputValueWei] = useState<string>('')

    const [inputEnabled, setInputEnabled] = useState<boolean>(false)
    const [inputAddress, setInputAddress] = useState<string>(tokenDropDownList[0].address)
    const [outputAddress, setOutputAddress] = useState<string>(tokenDropDownList[indexOfScarcityAddress].address)
    const [inputDecimals, setInputDecimals] = useState<number>(18)
    const [outputDecimals, setOutputDecimals] = useState<number>(18)

    useEffect(() => {
        API.getTokenDecimals(inputAddress).then(setInputDecimals)
    }, [inputAddress])

    useEffect(() => {
        API.getTokenDecimals(outputAddress).then(setOutputDecimals)
    }, [outputAddress])

    if (tokenDropDownList.filter((t) => t.address === outputAddress).length === 0) {
        setOutputAddress(tokenDropDownList[1])
    }
    if (tokenDropDownList.filter((t) => t.address === inputAddress).length === 0) {
        setInputAddress(tokenDropDownList[0])
    }
    const [exchangeRate, setExchangeRate] = useState<string>('')
    const [swapClicked, setSwapClicked] = useState<boolean>(false)

    const [outputReserve, setOutputReserve] = useState<string>('')
    const nameOfSelectedAddress = (address: string) => tokenDropDownList.filter((t) => t.address === address)[0].name
    const clearInput = () => {
        setInputValue('')
        setOutputValue('')
        setSwapClicked(false)
    }

    if (inputAddress === outputAddress) {
        setOutputAddress(tokenDropDownList.filter((t) => t.address !== inputAddress)[0].address)
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
    const inputReadyToEstimate = !bigInputValue.isNaN()


    const swapEnabled = swapPossible && inputEnabled

    const inputValWei = inputValid && !bigInputValue.isNaN() && bigInputValue.isGreaterThanOrEqualTo('0') ? API.toWei(inputValue, inputDecimals) : '0'

    let primaryOptions = { from: walletContextProps.account, gas: undefined };
    let ethOptions = { from: walletContextProps.account, value: inputValWei, gas: undefined };

    const isTokenPredicateFactory = (tokenName: string) => (address: string): boolean =>
        tokenDropDownList.filter((item) => item.address.trim().toLowerCase() === address.trim().toLowerCase())[0].name === tokenName
    const isEthPredicate = isTokenPredicateFactory('Eth')
    const isScarcityPredicate = isTokenPredicateFactory('Scarcity')
    const behodler = walletContextProps.contracts.behodler.Behodler2.Behodler2
    let swapText = 'SWAP'

    if (isScarcityPredicate(outputAddress)) {
        swapText = 'ADD LIQUIDITY'
    } else if (isScarcityPredicate(inputAddress)) {
        swapText = 'WITHDRAW LIQUIDITY'
    }

    const swap2Callback = useCallback(async () => {
        if (swapClicked) {
            if (inputAddress.toLowerCase() === scarcityAddress) {
                behodler
                    .withdrawLiquidity(outputAddress, outputValueWei)
                    .estimateGas(primaryOptions, function (error, gas) {
                        if (error) console.error("gas estimation error: " + error);
                        primaryOptions.gas = gas;
                        behodler.withdrawLiquidity(outputAddress, outputValueWei).send(primaryOptions, clearInput);
                    });
            } else if (outputAddress.toLowerCase() === scarcityAddress) {
                let options = isEthPredicate(inputAddress) ? ethOptions : primaryOptions;
                behodler.addLiquidity(inputAddress, inputValWei).estimateGas(options, function (error, gas) {
                    if (error) console.error("gas estimation error: " + error);
                    options.gas = gas;
                    behodler.addLiquidity(inputAddress, inputValWei).send(options, clearInput);
                });
            } else {
                let options = isEthPredicate(inputAddress) ? ethOptions : primaryOptions;
                behodler
                    .swap(inputAddress, outputAddress, inputValWei, outputValueWei)
                    .estimateGas(options, function (error, gas) {
                        if (error) console.error("gas estimation error: " + error);
                        options.gas = gas;
                        behodler
                            .swap(inputAddress, outputAddress, inputValWei, outputValueWei)
                            .send(options, clearInput);
                    });
            }
        }
        setSwapClicked(false)
    }, [swapClicked])

    useEffect(() => {
        if (swapClicked) {
            swap2Callback()
        }
    }, [swapClicked])

    const setTerms = (i: string, o: string) => {
        const iBig = new BigNumber(i)
        const oBig = new BigNumber(o)
        setExchangeRate(oBig.dividedBy(iBig).toString())
    }

    const validateLiquidityExit = async (tokensToWithdraw: any) => {
        const maxLiquidityExit = BigInt((await behodler.getMaxLiquidityExit().call(primaryOptions)).toString());
        const O_i = await API.getTokenBalance(outputAddress, behodler.address, false, outputDecimals);
        if (O_i === '0') {// division by zero
            setInputValid(false)
            return;
        }
        const hundred: any = BigInt(100);
        const exitRatio = (tokensToWithdraw * hundred) / (BigInt(O_i.toString()) as any);
        if (exitRatio > maxLiquidityExit) {
            setInputValid(false);
        }
    }
    const swapPreparationCallback = useCallback(async () => {
        if (inputReadyToEstimate) {
            const inputAmount = new BigNumber(API.toWei(inputValue, inputDecimals)).toFormat({groupSeparator: ''});

            //if input is scx, figure out tokensToRelease
            //if output is scx, nothing to figure out
            //if swap, set output Val
            if (isScarcityPredicate(inputAddress)) {
                //withdraw liquidity
                //ΔSCX = log(Initial) - log(Final)
                //log(FinalBalance) =  log(InitialBalance) - ΔSCX
                //let X = log(InitialBalance) - ΔSCX
                //FinalBalance = 2^X

                const O_i = new BigNumber(
                    await API.getTokenBalance(outputAddress, behodler.address, false, outputDecimals)
                );
                const guess = O_i.div(2).toFixed(0);
                const actual = BigInt(
                    (
                        await behodler
                            .withdrawLiquidityFindSCX(outputAddress, guess.toString(), inputValWei, "15")
                            .call(primaryOptions)
                    ).toString()
                );
                await validateLiquidityExit(actual);

                const actualString = actual.toString()
                setOutputValueWei(actualString)
                setOutputValue(API.fromWei(actualString))
                setTerms(inputAmount, actualString)
            } else if (isScarcityPredicate(outputAddress)) { //add liquidity
                let scx
                try {
                    const I_i = new BigNumber(await API.getTokenBalance(inputAddress, behodler.address, false, inputDecimals))
                    const burnFee = (await behodler.getConfiguration().call(primaryOptions))[1]
                    const behodlerPrice = walletContextProps.contracts.behodlerPrice
                    scx = await behodlerPrice.addLiquidity(inputAmount, I_i.toString(), burnFee.toString()).call()
                    const scxString = scx.toString()
                    setOutputValueWei(scxString)
                    setOutputValue(API.fromWei(scxString))
                    setTerms(inputValWei, scxString)
                } catch {
                    setInputValid(false);
                }
            } else {
                // I_f/I_i = O_i/O_f
                const I_i = BigInt(await API.getTokenBalance(inputAddress, behodler.address, false, inputDecimals));
                const burnFee = BigInt((await behodler.getConfiguration().call(primaryOptions))[1].toString());
                const bigInputValWei = BigInt(inputAmount);
                const netAmount = bigInputValWei - (burnFee * bigInputValWei) / BigInt(1000);
                // const netAmount = new BigNumber(inputValWei).minus(burnFee.mul(inputValWei).div(1000))
                const I_f = I_i + netAmount;

                const O_i = BigInt(await API.getTokenBalance(outputAddress, behodler.address, false, outputDecimals));

                const O_f = (O_i * I_i) / I_f;
                let outputWei = (O_i - O_f).toString();
                const indexOfPoint = outputWei.indexOf(".");
                outputWei = indexOfPoint === -1 ? outputWei : outputWei.substring(0, indexOfPoint);
                await validateLiquidityExit(BigInt(outputWei));
                setOutputValueWei(outputWei);
                setOutputValue(API.fromWei(outputWei));
                setTerms(inputValWei, outputWei);
            }
        }
    }, [inputReadyToEstimate, inputValue])

    useEffect(() => {
        if (inputReadyToEstimate) {
            swapPreparationCallback();
        }
    }, [inputReadyToEstimate, inputValue])
    const textFieldLabels = ['From', 'To']
    return (
        <Box className={classes.root}>
            <ExtendedTextField
                label={textFieldLabels[0]}
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
            <Box className={classes.iconWrapper}>
                <IconButton aria-label="delete" onClick={swapInputAddresses}>
                    <SwapVertIcon color="secondary" />
                </IconButton>
            </Box>
            <ExtendedTextField
                label={textFieldLabels[1]}
                dropDownFields={tokenDropDownList}
                valid={outputValid}
                setValid={setOutputValid}
                setValue={setOutputValue}
                setTokenAddress={setOutputAddress}
                address={outputAddress}
                value={outputValue}
                disabledInput
                exchangeRate={{
                    baseAddress: inputAddress,
                    baseName: nameOfSelectedAddress(inputAddress),
                    ratio: exchangeRate,
                    valid: swapEnabled,
                    reserve: outputReserve,
                    setReserve: setOutputReserve,
                }}
                clear={clearInput}
                decimalPlaces={outputDecimals}
            />
            <Box className={classes.buttonWrapper}>
                <Button disabled={!swapEnabled} variant="contained" color="primary" size="large" onClick={() => setSwapClicked(true)}>
                    {swapText}
                </Button>
            </Box>
        </Box>
    )
}
