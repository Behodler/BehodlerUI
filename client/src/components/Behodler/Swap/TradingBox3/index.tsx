import * as React from 'react'
import { useEffect, useCallback, useState, useContext } from 'react'
import ExtendedTextField from './ExtendedTextField'
import { Button, IconButton, Box, makeStyles, Theme, Grid, Hidden } from '@material-ui/core'
import tokenListJSON from '../../../../blockchain/behodlerUI/baseTokens.json'
import { WalletContext } from '../../../Contexts/WalletStatusContext'
import { Images } from './ImageLoader'
import SwapVertIcon from '@material-ui/icons/SwapVert'
import BigNumber from 'bignumber.js'
import API from '../../../../blockchain/ethereumAPI'
import NewField from './NewField'
import TokenSelector from './TokenSelector'

interface props {

}

const sideScaler = (scale) => (perc) => (perc / scale) + "%"


const scaler = sideScaler(0.8)
const useStyles = makeStyles((theme: Theme) => ({
    root: {

        margin: '50px auto',
        backgroundColor: 'rgba(255,255,255,0)',
        borderRadius: 20,
        alignContent: "center",
        height: "100vh",
    },
    iconWrapper: {
        display: 'flex',
        justifyContent: 'center',
        margin: '24px 0',
    },
    buttonWrapper: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid rgba(218, 86, 221)",
        borderRadius: "5px",
        marginTop: 70,
        left: "35%",
    },
    swapButton: {
        background: "linear-gradient(105.11deg, rgba(218, 86, 221,0.1) 46.06%, rgba(218, 86, 221,0.1) 77.76%)",

        width: 500,
        '&:hover': {
            background: "rgba(218, 86, 221,0.4)",
            fontWeight: "bolder",
            textShadow: "2px 2px 5px white"
        },
    },
    swapButtonMobile: {
        background: "linear-gradient(105.11deg, rgba(218, 86, 221,0.1) 46.06%, rgba(218, 86, 221,0.1) 77.76%)",

        width: 360,
        '&:hover': {
            background: "rgba(218, 86, 221,0.4)",
            fontWeight: "bolder",
            textShadow: "2px 2px 5px white"
        },
    },
    hideIt: { display: "none" },
    centerWrapper: {
        margin: "0 auto",
        width: "80%",
        maxWidth: "1300px",
        position: "absolute",
        left: "10%",
        top: "40%",
    },
    leftSelector: {
        position: "absolute",
        left: "37%",
        top: "40%"
    },
    rightSelector: {
        position: "absolute",
        right: "37%",
        top: "40%"
    },
    leftField: {
        position: "absolute",
        left: scaler(14),
        top: "40%"
    },
    rightField: {
        position: "absolute",
        right: scaler(15),
        top: "40%"

    },
    monsterContainer: {
        marginTop: 60,
        position: "relative",
        zIndex: 100,
        width: 220,
        height: 220,
     //   background: "radial-gradient(circle 90px, #DDD, transparent)",
        alignContent: "center",
      

    },
    monster: {
        display: "block",
        margin: "auto",
        borderRadius: "50%",
        '&:hover': {
            cursor: "pointer"
        }
    },

    fieldGrid: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: "100%"

    },
    Info: {
        right: "1%",
        color: "white",
        marginTop: 30
    }, mobileGrid: {
        width: 400,
    },
    mobileSelectorGrid: {
    },
    mobileContainer: {
        height: "100vh",
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    flippySwitch: {
        /* Ellipse 18 */
        width: 22,
        height: 22,
        marginTop:-260,
        background: "#2E2455",
        border: "1px solid #3C3682",
        boxSizing: "border-box",
        // top: 500,
        // left: 450,
        borderRadius: "50%",
        backgroundImage: `url(${Images[14]})`,
        backgroundSize: "cover",
        '&:hover': {
            cursor: "pointer",
            boxShadow:"0 0 4px 1px #AAf", 
            background: "#473D6E",
            backgroundImage: `url(${Images[14]})`,
            backgroundSize: "cover",
        }
    }


}))


export default function (props: props) {
    const classes = useStyles();
    BigNumber.config({ EXPONENTIAL_AT: 50, DECIMAL_PLACES: 18 });
    const walletContextProps = useContext(WalletContext);
    console.log("network name: " + walletContextProps.networkName)
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
    const inputReadyToSwap = inputValid && !bigInputValue.isNaN()

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
        if (inputReadyToSwap) {
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
                setTerms(inputValWei, actualString)
            } else if (isScarcityPredicate(outputAddress)) {
                //add liquidity

                let scx;
                try {
                    scx = await behodler
                        .addLiquidity(inputAddress, inputValWei)
                        .call(isEthPredicate(inputAddress) ? ethOptions : primaryOptions);
                    const scxString = scx.toString();
                    setOutputValueWei(scxString);
                    setOutputValue(API.fromWei(scxString));
                    setTerms(inputValWei, scxString);
                } catch {
                    setInputValid(false);
                }
            } else {
                // I_f/I_i = O_i/O_f
                const I_i = BigInt(await API.getTokenBalance(inputAddress, behodler.address, false, inputDecimals));
                const burnFee = BigInt((await behodler.getConfiguration().call(primaryOptions))[1].toString());
                const bigInputValWei = BigInt(inputValWei);
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
    }, [inputReadyToSwap, inputValue])

    useEffect(() => {
        if (inputReadyToSwap) {
            swapPreparationCallback()
        }
    }, [inputReadyToSwap, inputValue])
    const textFieldLabels = ['From', 'To']
    return (
        <Box className={classes.root}>
            <div className={classes.hideIt}>
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
            </div>

            <Hidden lgUp>
                <div className={classes.mobileContainer}>
                    <Grid
                        container
                        direction="column"
                        justify="center"
                        alignItems="center"
                        className={classes.mobileGrid}
                        spacing={3}
                    >
                        <Grid item>
                            <Grid
                                container
                                direction="row"
                                justify="center"
                                alignItems="center"
                                className={classes.mobileSelectorGrid}
                            >
                                <Grid item>
                                    <TokenSelector token={2} scale={0.65} mobile />
                                </Grid>
                                <Grid item>
                                    <img width={180} src={Images[13]} className={classes.monster} />
                                </Grid>
                                <Grid item>
                                    <TokenSelector token={4} scale={0.65} mobile/>
                                </Grid>
                            </Grid>

                        </Grid>
                        <Grid item>
                            <NewField direction="FROM" balance="3.1" estimate="1010.1" token="DAI" mobile />
                        </Grid>
                        <Grid item>
                            <NewField direction="TO" balance="30.1" estimate="101.1" token="SCX" mobile />
                        </Grid>
                        <Grid item>
                            <Box className={classes.buttonWrapper}>
                                <Button className={classes.swapButtonMobile} disabled={!swapEnabled && false} variant="contained" color="primary" size="large" onClick={() => setSwapClicked(true)}>
                                    {swapText}
                                </Button>
                            </Box>
                        </Grid>
                        <Grid item>
                            <div className={classes.flippySwitch} onClick={() => alert('TODO: flip tokens')} />
                        </Grid>
                        <Grid item>
                            <Grid container
                                direction="column"
                                justify="center"
                                alignItems="center"
                                spacing={2}
                                className={classes.Info}
                            >
                                <Grid item>
                                    1 ETH = 1 EYE
                                </Grid>
                                <Grid item>
                                    <Button color="secondary" variant="outlined">
                                        More info
                                    </Button>
                                </Grid>
                            </Grid>
                        </Grid>

                    </Grid>
                </div>
            </Hidden>

            <Hidden mdDown>

                <Grid container
                    direction="column"
                    justify="center"
                    alignItems="center"
                    className={classes.fieldGrid}
                >
                    <Grid item>
                        <Grid
                            container
                            direction="row"
                            justify="center"
                            alignItems="center"

                            spacing={3}
                        >
                            <Grid item>
                                <NewField direction="FROM" balance="3.1" estimate="1010.1" token="DAI" />
                            </Grid>
                            <Grid item>
                                <Grid
                                    container
                                    direction="row"
                                    justify="space-between"
                                    alignItems="center"
                                >
                                    <Grid item>
                                        <TokenSelector token={2} scale={0.8} />
                                    </Grid>
                                    <Grid item>
                                        <div className={classes.monsterContainer}>

                                            <img width={220} src={Images[13]} className={classes.monster} onClick={() => alert("TODO: flip tokens")} />
                                        </div>
                                    </Grid>
                                    <Grid item>
                                        <TokenSelector token={4} scale={0.8} />
                                    </Grid>
                                </Grid>
                            </Grid>

                            <Grid item>
                                <NewField direction="TO" balance="200.1" estimate="4200.1" token="EYE" />
                            </Grid>
                        </Grid>

                    </Grid>
                    <Grid item>

                        <Box className={classes.buttonWrapper}>

                            <Button className={classes.swapButton} disabled={!swapEnabled && false} variant="contained" color="primary" size="large" onClick={() => setSwapClicked(true)}>
                                {swapText}
                            </Button>

                        </Box>
                    </Grid>
                    <Grid item>
                        <Grid container
                            direction="column"
                            justify="center"
                            alignItems="center"
                            spacing={2}
                            className={classes.Info}
                        >
                            <Grid item>
                                1 ETH = 1 EYE
                            </Grid>
                            <Grid item>
                                <Button color="secondary" variant="outlined">
                                    More info
                                </Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Hidden>
        </Box>
    )
}

