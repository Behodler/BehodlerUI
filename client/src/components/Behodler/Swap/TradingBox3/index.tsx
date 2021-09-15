import * as React from 'react'
import { useEffect, useCallback, useState, useContext } from 'react'
import { Button, Box, makeStyles, Theme, Grid, Hidden, CircularProgress, Tooltip } from '@material-ui/core'
import tokenListJSON from '../../../../blockchain/behodlerUI/baseTokens.json'
import { WalletContext } from '../../../Contexts/WalletStatusContext'
import { Images } from './ImageLoader'
import BigNumber from 'bignumber.js'
import API from '../../../../blockchain/ethereumAPI'
import NewField, { tokenProps } from './NewField'
import TokenSelector from './TokenSelector'
import { UIContainerContextProps } from '@behodler/sdk/dist/types'
import { ContainerContext } from 'src/components/Contexts/UIContainerContextDev'
import { Notification, NotificationType } from './Notification'
import FetchBalances from './FetchBalances'
import { formatSignificantDecimalPlaces } from 'src/util/jsHelpers'
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
    buttonWrapperDisabled: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid rgba(60, 60, 60)",
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
    swapButtonDisabled: {
        color: "grey",
        backgroundColor: "rgba(100,100,100,0.3)",
        width: 500,
        '&:hover': {
            backgroundColor: "rgba(100,100,100,0.3)",

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
    swapButtonMobileDisabled: {
        color: "grey",
        backgroundColor: "rgba(100,100,100,0.3)",

        width: 360,
        '&:hover': {
            backgroundColor: "rgba(100,100,100,0.3)",
        },
    },
    hideIt: {
        color: "white",
        fontWeight: "bold",
        display: "none"
    },
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
        marginTop: -260,
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
            boxShadow: "0 0 4px 1px #AAf",
            background: "#473D6E",
            backgroundImage: `url(${Images[14]})`,
            backgroundSize: "cover",
        }
    }, transactionFeedbackState: {
        fontSize: 30,
        color: "white"
    }
}))

enum TXType {
    approval,
    swap,
    addLiquidity,
    withdrawLiquidity,
    mintPyro,
    redeemPyro
}

interface PendingTX {
    hash: string
    type: TXType,
    token1: string
    token2: string
}

export interface TokenListItem {
    address: string
    name: string
    image: string
}

export interface TokenBalanceMapping {
    address: string
    balance: string
}
export default function (props: {}) {
    const classes = useStyles();
    BigNumber.config({ EXPONENTIAL_AT: 50, DECIMAL_PLACES: 18 });

    const walletContextProps = useContext(WalletContext);
    const uiContainerContextProps = useContext<UIContainerContextProps>(ContainerContext)

    const account = uiContainerContextProps.walletContext.account || "0x0"
    const networkName = API.networkMapping[(uiContainerContextProps.walletContext.chainId || 0).toString()]
    const tokenList: any[] = tokenListJSON[networkName].filter(
        (t) => t.name !== "WBTC" && t.name !== "BAT"
    );

    const indexOfWeth = tokenList.findIndex((item) => item.name.toLowerCase().indexOf("weth") !== -1);
    const indexOfScarcityAddress = tokenList.findIndex((item) => item.name.toLowerCase().indexOf("scarcity") !== -1);
    const behodler2Weth = walletContextProps.contracts.behodler.Behodler2.Weth10.address;

    let tokenDropDownList: TokenListItem[] = tokenList.map((t, i) => {
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

    const contracts = tokenDropDownList.map(t => ({ name: t.name, address: t.address }))

    //NEW HOOKS BEGIN
    const [pendingTXQueue, setPendingTXQueue] = useState<PendingTX[]>([])
    const [block, setBlock] = useState<string>("")
    const [showNotification, setShowNotification] = useState<boolean>(false)
    const [currentTxHash, setCurrentTxHash] = useState<string>("")
    const [notificationType, setNotificationType] = useState<NotificationType>(NotificationType.pending)
    const [outstandingTXCount, setOutstandingTXCount] = useState<number>(0)
    const [tokenBalances, setTokenBalances] = useState<TokenBalanceMapping[]>([])
    const [swapping, setSwapping] = useState<boolean>(false)

    const notify = (hash: string, type: NotificationType) => {
        setCurrentTxHash(hash)
        setNotificationType(type)
        setShowNotification(true)
        setOutstandingTXCount(type === NotificationType.pending ? outstandingTXCount + 1 : outstandingTXCount - 1)
        if (type === NotificationType.pending)
            setSwapping(true)
        else setSwapping(false)
    }

    const balanceCheck = async (menu: string) => {
        const balanceResults = await FetchBalances(uiContainerContextProps.walletContext.account || "0x0", contracts)
        let balances: TokenBalanceMapping[] = tokenDropDownList.map(t => {
            let hexBalance = balanceResults.results[t.name].callsReturnContext[0].returnValues[0].hex.toString()
            let address = t.address
            let decimalBalance = API.web3.utils.hexToNumberString(hexBalance)
            return { address, balance: decimalBalance }
        })
        const ethBalance = await API.getEthBalance(uiContainerContextProps.walletContext.account || "0x0")
        let ethUpdated = balances.map(b => {
            if (b.address === behodler2Weth) {
                return { ...b, balance: ethBalance }
            }
            return b
        })
        if (JSON.stringify(ethUpdated) !== JSON.stringify(tokenBalances)) {
            setTokenBalances(ethUpdated)
        }
        // console.log("balance retrieved: " + balanceResults.results["Link"].callsReturnContext[0].returnValues[0].hex.toString())
        // // const multiBalance = balanceResults.results["LINK"].callsReturnContext[0].returnValues[0]
        // // console.log(multiBalance.toString())
    }
    const balanceCallback = useCallback(async (menu: string) => await balanceCheck(menu), [block])

    useEffect(() => {
        const bigBlock = BigInt(block)
        const three = BigInt(1)
        if (bigBlock % three === BigInt(0)) {
            balanceCallback(block)
        }
    }, [block])

    const fetchToken = (address: string): TokenListItem => tokenDropDownList.filter(t => t.address.toLowerCase() === address.toLowerCase())[0]
    // const [intervalTracker, setIntervalTracker] = useState<any>()
    const txQueuePush = (val: PendingTX) => {

        const newQueue = [...pendingTXQueue, val]
        setPendingTXQueue(newQueue)
    }
    const txDequeue = () => {
        let newArray = [...pendingTXQueue]
        newArray.shift()
        setPendingTXQueue(newArray)
    }
    const peekTX = () => {
        if (pendingTXQueue.length == 0)
            return false
        return pendingTXQueue[0]
    }
    if (block === "") {
        API.addBlockWatcher(setBlock)
    }
    const queueUpdateCallback = useCallback(async (outstanding: number) => {

        const top = peekTX()
        if (!top) return;
        const receipt = await API.getTransactionReceipt(top.hash)

        if (!!receipt) {
            txDequeue()
            if (receipt.status)
                notify(top.hash, NotificationType.success)
            else
                notify(top.hash, NotificationType.fail)
        }
    }, [block])

    useEffect(() => {
        queueUpdateCallback(outstandingTXCount)
    }, [block])

    //NEW HOOKS END

    const [inputValid, setInputValid] = useState<boolean>(true)
    const [outputValid, setOutputValid] = useState<boolean>(true)
    const [inputValue, setInputValue] = useState<string>('')
    const [outputValue, setOutputValue] = useState<string>('')
    const [outputValueWei, setOutputValueWei] = useState<string>('')

    const [inputEnabled, setInputEnabled] = useState<boolean>(false)
    const [inputAddress, setInputAddress] = useState<string>(tokenDropDownList[0].address.toLowerCase())
    const [outputAddress, setOutputAddress] = useState<string>(tokenDropDownList[indexOfScarcityAddress].address.toLowerCase())
    const [inputDecimals, setInputDecimals] = useState<number>(18)
    const [outputDecimals, setOutputDecimals] = useState<number>(18)
    const [swapText, setSwapText] = useState<string>("SWAP")
    const [impliedExchangeRate, setImpliedExchangeRate] = useState<string>("")
    const [inputSpotDaiPrice, setInputSpotDaiPrice] = useState<string>("")
    const [outputSpotDaiPrice, setOutputSpotDaiPrice] = useState<string>("")

    useEffect(() => {
        if (inputValue.length > 0 && outputValue.length > 0 && !isNaN(parseFloat(outputValue)) && parseFloat(outputValue) > 0 && inputValid && parseFloat(inputValue) > 0) {
            const parsedInput = parseFloat(inputValue)
            const parsedOutput = parseFloat(outputValue)
            if (parsedInput > parsedOutput) {
                const exchangeRate = formatSignificantDecimalPlaces((parsedInput / parsedOutput).toString(), 6)
                setImpliedExchangeRate(`1 ${nameOfSelectedAddress(outputAddress).toUpperCase()} = ${exchangeRate} ${nameOfSelectedAddress(inputAddress).toUpperCase()}`)
            } else {
                const exchangeRate = formatSignificantDecimalPlaces((parsedOutput / parsedInput).toString(), 6)
                setImpliedExchangeRate(`1 ${nameOfSelectedAddress(inputAddress).toUpperCase()} = ${exchangeRate} ${nameOfSelectedAddress(outputAddress).toUpperCase()}`)
            }
        }
        else {
            setImpliedExchangeRate("")
        }
    }, [inputValue, outputValue])

    const spotPriceCallback = useCallback(async () => {
        const daiAddress = tokenDropDownList.filter(d => d.name.toUpperCase() === "DAI")[0].address
        const DAI = await API.getToken(daiAddress, walletContextProps.networkName)
        const daiBalanceOnBehodler = new BigNumber(await DAI.balanceOf(walletContextProps.contracts.behodler.Behodler2.Behodler2.address).call({ from: account }))


        if (isScarcityPredicate(inputAddress)) {
            const scxSpotString = (await walletContextProps.contracts.behodler.Behodler2.Behodler2.withdrawLiquidityFindSCX(daiAddress, "10000", "10", "16").call({ from: account })).toString()
            const scxSpotPrice = new BigNumber(scxSpotString)
                .div(10)
                .toString()
            setInputSpotDaiPrice(formatSignificantDecimalPlaces(scxSpotPrice, 2))
        } else {
            const inputToken = await API.getToken(inputAddress, walletContextProps.networkName)
            const inputBalanceOnBehodler = await inputToken.balanceOf(walletContextProps.contracts.behodler.Behodler2.Behodler2.address).call({ from: account })
            const inputSpot = daiBalanceOnBehodler.div(inputBalanceOnBehodler).toString()
            setInputSpotDaiPrice(formatSignificantDecimalPlaces(inputSpot, 2))
        }

        if (isScarcityPredicate(outputAddress)) {
            const scxSpotString = (await walletContextProps.contracts.behodler.Behodler2.Behodler2.withdrawLiquidityFindSCX(daiAddress, "10000", "10", "16").call({ from: account })).toString()
            const scxSpotPrice = new BigNumber(scxSpotString)
                .div(10)
                .toString()
            setOutputSpotDaiPrice(formatSignificantDecimalPlaces(scxSpotPrice, 2))
        }
        else {
            const outputToken = await API.getToken(outputAddress, walletContextProps.networkName)
            const outputBalanceOnBehodler = await outputToken.balanceOf(walletContextProps.contracts.behodler.Behodler2.Behodler2.address).call({ from: account })
            const outputSpot = daiBalanceOnBehodler.div(outputBalanceOnBehodler).toString()
            setOutputSpotDaiPrice(formatSignificantDecimalPlaces(outputSpot, 2))
        }
    }, [inputAddress, outputAddress])

    useEffect(() => {
        spotPriceCallback()
    }, [inputAddress, outputAddress])

    useEffect(() => {
        API.getTokenDecimals(inputAddress).then(setInputDecimals)
        setImpliedExchangeRate("")
    }, [inputAddress])

    useEffect(() => {
        API.getTokenDecimals(outputAddress).then(setOutputDecimals)
        setImpliedExchangeRate("")
    }, [outputAddress])

    if (tokenDropDownList.filter((t) => t.address.toLowerCase() === outputAddress.toLowerCase()).length === 0) {
        setOutputAddress(tokenDropDownList[1].address.toLowerCase())
    }
    if (tokenDropDownList.filter((t) => t.address.toLowerCase() === inputAddress.toLowerCase()).length === 0) {
        setInputAddress(tokenDropDownList[0].address.toLowerCase())
    }

    const [swapClicked, setSwapClicked] = useState<boolean>(false)
    const nameOfSelectedAddress = (address: string) => tokenDropDownList.filter((t) => t.address.toLowerCase() === address.toLowerCase())[0].name

    if (inputAddress === outputAddress) {
        setOutputAddress(tokenDropDownList.filter((t) => t.address !== inputAddress)[0].address)
    }

    const bigInputValue = new BigNumber(inputValue)
    const bigOutputValue = new BigNumber(outputValue)

    const swapPossible = inputValid && outputValid && !bigInputValue.isNaN() && !bigOutputValue.isNaN()
    const inputReadyToSwap = inputValid && !bigInputValue.isNaN()

    const swapEnabled = swapPossible && inputEnabled

    const inputValWei = inputValid && !bigInputValue.isNaN() && bigInputValue.isGreaterThanOrEqualTo('0') ? API.toWei(inputValue, inputDecimals) : '0'

    let primaryOptions = { from: account, gas: undefined };
    let ethOptions = { from: account, value: inputValWei, gas: undefined };

    const isTokenPredicateFactory = (tokenName: string) => (address: string): boolean =>
        tokenDropDownList.filter((item) => item.address.trim().toLowerCase() === address.trim().toLowerCase())[0].name === tokenName
    const isEthPredicate = isTokenPredicateFactory('Eth')
    const isScarcityPredicate = isTokenPredicateFactory('Scarcity')
    const behodler = walletContextProps.contracts.behodler.Behodler2.Behodler2

    useEffect(() => {

        if (!inputEnabled) {
            setSwapText('APPROVE ' + nameOfSelectedAddress(inputAddress))
        }
        else if (isScarcityPredicate(outputAddress)) {
            setSwapText('ADD LIQUIDITY')
        } else if (isScarcityPredicate(inputAddress)) {
            setSwapText('WITHDRAW LIQUIDITY')
        }
        else {
            setSwapText('SWAP')
        }
    }, [inputEnabled, isEthPredicate(inputAddress), inputAddress, outputAddress])

    const hashBack = (type: TXType) => (err, hash: string) => {
        if (hash) {
            let t: PendingTX = {
                hash,
                type,
                token1: inputAddress,
                token2: outputAddress,
            }
            txQueuePush(t)
            notify(hash, NotificationType.pending)
        } else {
            notify(hash, NotificationType.rejected)
        }
    }

    const addLiquidityHashBack = hashBack(TXType.addLiquidity)
    const withdrawLiquidityHashBack = hashBack(TXType.withdrawLiquidity)
    const swapHashBack = hashBack(TXType.swap)

    const swap2Callback = useCallback(async () => {
        if (swapClicked) {
            if (inputAddress.toLowerCase() === scarcityAddress) {
                behodler
                    .withdrawLiquidity(outputAddress, outputValueWei)
                    .estimateGas(primaryOptions, function (error, gas) {
                        if (error) console.error("gas estimation error: " + error);
                        primaryOptions.gas = gas;
                        behodler.withdrawLiquidity(outputAddress, outputValueWei)
                            .send(primaryOptions, withdrawLiquidityHashBack)
                            .catch(err => console.log('user rejection'))
                    });
            } else if (outputAddress.toLowerCase() === scarcityAddress) {
                let options = isEthPredicate(inputAddress) ? ethOptions : primaryOptions;

                behodler.addLiquidity(inputAddress, inputValWei).estimateGas(options, function (error, gas) {
                    if (error) console.error("gas estimation error: " + error);
                    options.gas = gas;
                    behodler.addLiquidity(inputAddress, inputValWei)
                        .send(options, addLiquidityHashBack)
                        .catch(err => console.log('user rejection'))
                })

            } else {
                let options = isEthPredicate(inputAddress) ? ethOptions : primaryOptions;
                behodler
                    .swap(inputAddress, outputAddress, inputValWei, outputValueWei)
                    .estimateGas(options, function (error, gas) {
                        if (error) console.error("gas estimation error: " + error);
                        options.gas = gas;
                        behodler
                            .swap(inputAddress, outputAddress, inputValWei, outputValueWei)
                            .send(options, swapHashBack)
                            .catch(err => console.log('user rejection'))
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

            } else if (isScarcityPredicate(outputAddress)) {
                //add liquidity

                let scx;
                try {
                    scx = await behodler
                        .addLiquidity(inputAddress, inputValWei)
                        .call(isEthPredicate(inputAddress) ? ethOptions : primaryOptions);
                    const scxString = scx.toString();
                    setOutputValueWei(scxString);
                    setOutputValue(API.fromWei(scxString))
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

            }
        }
    }, [inputReadyToSwap, inputValue])

    useEffect(() => {
        if (inputReadyToSwap) {
            swapPreparationCallback()
        }
    }, [inputReadyToSwap, inputValue])
    const fromBalance = tokenBalances.filter(t => t.address.toLowerCase() === inputAddress.toLowerCase())
    const toBalance = tokenBalances.filter(t => t.address.toLowerCase() === outputAddress.toLowerCase())
    const FromProps: tokenProps = {
        address: inputAddress,
        value: { value: inputValue, set: setInputValue },
        balance: formatSignificantDecimalPlaces(fromBalance.length > 0 ? API.fromWei(fromBalance[0].balance) : '0', 4),
        estimate: inputSpotDaiPrice,
        valid: { value: inputValid, set: setInputValid },
        approved: { value: inputEnabled, set: setInputEnabled }
    }
    const ToProps: tokenProps = {
        address: inputAddress,
        value: { value: outputValue, set: setOutputValue },
        balance: formatSignificantDecimalPlaces(toBalance.length > 0 ? API.fromWei(toBalance[0].balance) : '0', 4),
        estimate: outputSpotDaiPrice,
        valid: { value: outputValid, set: setOutputValid }

    }

    const swapAction = async () => {
        if (!swapEnabled) {
            console.log('no swap')
            return
        }
        if (inputEnabled)
            setSwapClicked(true)
        else {
            await API.enableToken(
                inputAddress,
                uiContainerContextProps.walletContext.account || "",
                walletContextProps.contracts.behodler.Behodler.address, (err, hash: string) => {
                    if (hash) {
                        let t: PendingTX = {
                            hash,
                            type: TXType.approval,
                            token1: inputAddress,
                            token2: outputAddress,
                        }
                        txQueuePush(t)
                        notify(hash, NotificationType.pending)
                    } else {
                        notify(hash, NotificationType.rejected)
                    }
                })
        }
    }
    const greySwap = inputEnabled && !swapEnabled
    return (
        <Box className={classes.root}>
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
                                    <TokenSelector network={networkName} setAddress={setInputAddress} tokenImage={fetchToken(inputAddress).image}
                                        scale={0.65} mobile balances={tokenBalances} />
                                </Grid>
                                <Grid item>
                                    <img width={180} src={swapping ? Images[15] : Images[13]} className={classes.monster} />
                                </Grid>
                                <Grid item>
                                    <TokenSelector network={networkName} balances={tokenBalances} setAddress={setOutputAddress} tokenImage={fetchToken(outputAddress).image} scale={0.65} mobile />
                                </Grid>
                            </Grid>

                        </Grid>
                        <Grid item>
                            <NewField isEth={isEthPredicate(inputAddress)} key="MobilFrom" direction="FROM" token={FromProps} mobile />
                        </Grid>
                        <Grid item>
                            <NewField isEth={false} key="MobilTo" direction="TO" token={ToProps} mobile />
                        </Grid>
                        <Grid item>
                            <Box className={greySwap ? classes.buttonWrapperDisabled : classes.buttonWrapper}>
                                <Button className={greySwap ? classes.swapButtonMobileDisabled : classes.swapButtonMobile} disabled={!swapEnabled && false} variant="contained" color="primary" size="large" onClick={swapAction}>
                                    {swapText}
                                </Button>
                            </Box>
                        </Grid>
                        <Grid item>
                            <div className={classes.flippySwitch} onClick={() => {
                                const inputAddressTemp = inputAddress
                                setInputAddress(outputAddress)
                                setOutputAddress(inputAddressTemp)
                            }} />
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
                                    {impliedExchangeRate}
                                </Grid>
                                <Grid item>
                                    <Button color="secondary" variant="outlined">
                                        More info
                                    </Button>
                                </Grid>
                                <Grid item>
                                    {outstandingTXCount > 0 ?
                                        <Tooltip title={"awaiting transaction " + currentTxHash}>
                                            <CircularProgress />
                                        </Tooltip>
                                        : <div></div>
                                    }
                                </Grid>
                            </Grid>
                        </Grid>

                    </Grid>
                </div>
            </Hidden>
            <Notification type={notificationType} hash={currentTxHash} open={showNotification} setOpen={setShowNotification} />
            <Box>
            </Box>
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
                                <NewField isEth={isEthPredicate(inputAddress)} key="DesktopFrom" direction="FROM" token={FromProps} />
                            </Grid>
                            <Grid item>
                                <Grid
                                    container
                                    direction="row"
                                    justify="space-between"
                                    alignItems="center"
                                >
                                    <Grid item>
                                        <TokenSelector balances={tokenBalances} network={networkName} setAddress={setInputAddress} tokenImage={fetchToken(inputAddress).image} scale={0.8} />
                                    </Grid>
                                    <Grid item>
                                        <div className={classes.monsterContainer} >
                                            <Tooltip title={swapping ? "" : "FLIP TOKEN ORDER"}>
                                                <img width={220} src={swapping ? Images[15] : Images[13]} className={classes.monster} onClick={() => {
                                                    const inputAddressTemp = inputAddress
                                                    setInputAddress(outputAddress)
                                                    setOutputAddress(inputAddressTemp)
                                                }} />
                                            </Tooltip>
                                        </div>
                                    </Grid>
                                    <Grid item>
                                        <TokenSelector balances={tokenBalances} network={networkName} setAddress={setOutputAddress} tokenImage={fetchToken(outputAddress).image} scale={0.8} />
                                    </Grid>
                                </Grid>
                            </Grid>

                            <Grid item>
                                <NewField isEth={false} key="DesktopTo" direction="TO" token={ToProps} />
                            </Grid>
                        </Grid>

                    </Grid>
                    <Grid item>

                        <Box className={greySwap ? classes.buttonWrapperDisabled : classes.buttonWrapper}>

                            <Button className={greySwap ? classes.swapButtonDisabled : classes.swapButton} disabled={!swapEnabled && false} variant="contained" color="primary" size="large" onClick={swapAction}>
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
                                {impliedExchangeRate}
                            </Grid>
                            <Grid item>
                                <Button color="secondary" variant="outlined">
                                    More info
                                </Button>
                            </Grid>
                            <Grid item>
                                {outstandingTXCount > 0 ?
                                    <Tooltip title={"awaiting transaction " + currentTxHash}>
                                        <CircularProgress />
                                    </Tooltip>
                                    : <div></div>
                                }
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Hidden>
        </Box >
    )
}

