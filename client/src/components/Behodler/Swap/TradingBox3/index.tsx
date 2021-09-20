import * as React from 'react'
import { useEffect, useCallback, useState, useContext } from 'react'
import { Button, Box, makeStyles, Theme, Grid, Hidden, CircularProgress, Tooltip, Link } from '@material-ui/core'
import tokenListJSON from '../../../../blockchain/behodlerUI/baseTokens.json'
import { WalletContext } from '../../../Contexts/WalletStatusContext'
import { Images } from './ImageLoader'
import BigNumber from 'bignumber.js'
import API from '../../../../blockchain/ethereumAPI'
import TokenSelector from './TokenSelector'
import { UIContainerContextProps } from '@behodler/sdk/dist/types'
import { ContainerContext } from 'src/components/Contexts/UIContainerContextDev'
import { Notification, NotificationType } from './Notification'
import FetchBalances from './FetchBalances'
import { formatNumberText, formatSignificantDecimalPlaces } from 'src/util/jsHelpers'
import MoreInfo, { InputType } from './MoreInfo'
import AmountFormat from './AmountFormat'
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
        top: "40%",
        zIndex: 10
    },
    rightSelector: {
        position: "absolute",
        right: "37%",
        top: "40%",
        zIndex: 10
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
        position: "relative",
        zIndex: 1,
        width: 350,
        //   background: "radial-gradient(circle 90px, #DDD, transparent)",
        alignContent: "center",
        margin: "60px -45px 0px -55px"

    },
    monster: {
        display: "block",
        margin: "auto",
        '&:hover': {
            cursor: "pointer"
        },
        filter: "brightness(1.3)"
    },
    monsterMobile: {
        display: "block",
        margin: "0 -30px 0 -35px",
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
    },
    moreInfo: {
        position: "relative"
    },
    impliedExchangeRate: {
        minHeight: "30px"
    }
}))


const textScaler = (scale) => num => Math.floor(num * scale)
const scale = textScaler(0.9)
const inputStyles = makeStyles((theme: Theme) => ({
    root: {
        width: scale(310),
    },
    mobileRoot: {
        width: scale(400),
        background: "#360C57",
        borderRadius: 10,
        padding: 10
    },
    Direction: {

        // height: 17,
        fontFamily: "Gilroy-medium",
        fontStyle: "normal",
        fontWeight: 600,
        fontSize: scale(16),
        // lineHeight: 17,
        /* identical to box height */
        color: "darkGrey",
        textAlign: "center",
        verticalAlign: " middle",
    },
    BalanceContainer: {

    },
    BalanceLabel: {
        height: scale(19),

        fontFamily: "Gilroy-medium",
        fontStyle: "normal",
        fontWeight: 600,
        fontSize: scale(16),
        /* identical to box height */

        color: "darkGrey"
    },
    BalanceValue: {

        height: scale(19),

        fontFamily: "Gilroy-medium",
        fontStyle: "normal",
        fontWeight: 600,
        fontSize: scale(16),
        color: "white"
    },
    Max: {
        /* (MAX) */

        height: scale(19),

        fontFamily: "Gilroy-medium",
        fontStyle: "normal",
        fontWeight: 600,
        fontSize: scale(16),
        /* identical to box height */

        color: "#80C2FF",
        cursor: 'pointer'

    },
    PaddedGridItem: {
        marginRight: '5px',
        padding: 0
    },
    estimate: {
        height: scale(19),

        fontFamily: "Gilroy-medium",
        fontStyle: "normal",
        fontWeight: 600,
        fontSize: scale(16),
        color: "white"
    },
    dollarSign: {
        color: "grey",
        marginRight: 5,
        display: "inline"
    },

    inputWide: {
        /* Vector */
        width: scale(300),
        height: scale(57),
        background: "#360C57",
        border: "1px solid rgba(70, 57, 130, 0.5)",
        boxSizing: "border-box",
        /* 2.00073731114506 */

        fontFamily: "Gilroy-medium",
        fontStyle: "normal",
        fontWeight: 500,
        fontSize: scale(24),
        padding: "10px 20px 10px 20px",
        color: "#FFFFFF",
        outline: 0,
        borderRadius: 5,
        placeholder: {
            direction: "rtl"
        }
    },
    inputNarrow: {
        width: scale(270),
        background: "transparent",
        border: "none",
        /* 2.00073731114506 */

        fontFamily: "Gilroy-medium",
        fontStyle: "normal",
        fontWeight: 500,
        fontSize: scale(20),
        color: "#FFFFFF",
        outline: 0,
        placeHolder: {
            direction: "rtl"
        }

    },
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
    const inputClasses = inputStyles();
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
        const two = BigInt(2)
        if (bigBlock % two === BigInt(0)) {
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

    const [inputSpotDaiPriceView, setinputSpotDaiPriceView] = useState<string>("")
    const [outputSpotDaiPriceView, setoutputSpotDaiPriceView] = useState<string>("")

    const [exchangeRate, setExchangeRate] = useState<number>(0)
    const [inputBurnable, setInputBurnable] = useState<boolean>(false)
    const [expectedFee, setExpectedFee] = useState<string>("")
    const [priceImpact, setPriceImpact] = useState<string>("")

    const setFormattedInputFactory = (setValue: (v: string) => void, setValid: (v: boolean) => void) => (value: string, valid: boolean, balance: string) => {
        const formattedText = formatNumberText(value)
        setValue(value)
        const parsedValue = parseFloat(formattedText)
        const isValid = isNaN(parsedValue) ? false : parsedValue < parseFloat(balance)
        if (valid != isValid)
            setValid(isValid)

    }

    const setFormattingFrom = setFormattedInputFactory(setInputValue, setInputValid)
    const setFormattingTo = setFormattedInputFactory(setOutputValue, setOutputValid)
    useEffect(() => {
        if (inputValue.length > 0 && outputValue.length > 0 && !isNaN(parseFloat(outputValue)) && parseFloat(outputValue) > 0 && inputValid && parseFloat(inputValue) > 0) {
            const parsedInput = parseFloat(inputValue)
            const parsedOutput = parseFloat(outputValue)
            if (parsedInput > parsedOutput) {
                const e = parsedInput / parsedOutput
                setExchangeRate(e)

                const exchangeRateString = formatSignificantDecimalPlaces((e).toString(), 6)
                setImpliedExchangeRate(`1 ${nameOfSelectedAddress(outputAddress).toUpperCase()} = ${exchangeRateString} ${nameOfSelectedAddress(inputAddress).toUpperCase()}`)
            } else {
                const e = parsedOutput / parsedInput
                setExchangeRate(e)
                const exchangeRateString = formatSignificantDecimalPlaces((e).toString(), 6)
                setImpliedExchangeRate(`1 ${nameOfSelectedAddress(inputAddress).toUpperCase()} = ${exchangeRateString} ${nameOfSelectedAddress(outputAddress).toUpperCase()}`)
            }
        }
        else {
            setImpliedExchangeRate("")
        }
    }, [inputValue, outputValue])

    const spotPriceCallback = useCallback(async () => {
        setInputValue("")
        setOutputValue("")
        const daiAddress = tokenDropDownList.filter(d => d.name.toUpperCase() === "DAI")[0].address
        const DAI = await API.getToken(daiAddress, walletContextProps.networkName)
        const daiBalanceOnBehodler = new BigNumber(await DAI.balanceOf(walletContextProps.contracts.behodler.Behodler2.Behodler2.address).call({ from: account }))


        if (isScarcityPredicate(inputAddress)) {
            const scxSpotString = (await walletContextProps.contracts.behodler.Behodler2.Behodler2.withdrawLiquidityFindSCX(daiAddress, "10000", "10", "15").call({ from: account })).toString()
            const scxSpotPrice = new BigNumber(scxSpotString)
                .div(10)
                .toString()
            setinputSpotDaiPriceView(formatSignificantDecimalPlaces(scxSpotPrice, 2))
        } else {
            const inputToken = await API.getToken(inputAddress, walletContextProps.networkName)
            const inputBalanceOnBehodler = await inputToken.balanceOf(walletContextProps.contracts.behodler.Behodler2.Behodler2.address).call({ from: account })
            const inputSpot = daiBalanceOnBehodler.div(inputBalanceOnBehodler).toString()
            setinputSpotDaiPriceView(formatSignificantDecimalPlaces(inputSpot, 2))
        }

        if (isScarcityPredicate(outputAddress)) {
            const scxSpotString = (await walletContextProps.contracts.behodler.Behodler2.Behodler2.withdrawLiquidityFindSCX(daiAddress, "10000", "10", "15").call({ from: account })).toString()
            const scxSpotPrice = new BigNumber(scxSpotString)
                .div(10)
                .toString()
            setoutputSpotDaiPriceView(formatSignificantDecimalPlaces(scxSpotPrice, 2))
        }
        else {
            const outputToken = await API.getToken(outputAddress, walletContextProps.networkName)
            const outputBalanceOnBehodler = await outputToken.balanceOf(walletContextProps.contracts.behodler.Behodler2.Behodler2.address).call({ from: account })
            const outputSpot = daiBalanceOnBehodler.div(outputBalanceOnBehodler).toString()
            setoutputSpotDaiPriceView(formatSignificantDecimalPlaces(outputSpot, 2))
        }
    }, [inputAddress, outputAddress])

    useEffect(() => {
        spotPriceCallback()
    }, [inputAddress, outputAddress])


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

    const inputBurnableCallback = useCallback(async () => {
        if (isScarcityPredicate(inputAddress)) {
            setInputBurnable(false)
            return;
        }
        const addressToUse = isEthPredicate(inputAddress) ? behodler2Weth : inputAddress
        setInputBurnable((await walletContextProps.contracts.behodler.Behodler2.Lachesis.cut(addressToUse).call({ from: account }))[1])
    }, [inputAddress, swapEnabled])

    useEffect(() => { inputBurnableCallback() }, [inputAddress, swapEnabled])

    useEffect(() => {

        if (!inputEnabled && !isScarcityPredicate(inputAddress)) {
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

    const currentTokenEffects = API.generateNewEffects(inputAddress, account, isEthPredicate(inputAddress))
    const behodlerAddress = walletContextProps.contracts.behodler.Behodler2.Behodler2.address

    useEffect(() => {
        const balance = formatSignificantDecimalPlaces(fromBalance.length > 0 ? API.fromWei(fromBalance[0].balance) : '0', 4)
        API.getTokenDecimals(inputAddress).then(setInputDecimals)
        setImpliedExchangeRate("")

        if (isEthPredicate(inputAddress) || isScarcityPredicate(inputAddress)) {
            setInputEnabled(true)
            return
        }
        const effect = currentTokenEffects.allowance(account, behodlerAddress)
        const subscription = effect.Observable.subscribe((allowance) => {
            const scaledAllowance = API.fromWei(allowance)
            const allowanceFloat = parseFloat(scaledAllowance)
            const balanceFloat = parseFloat(balance)
            const en = !(isNaN(allowanceFloat) || isNaN(balanceFloat) || allowanceFloat < balanceFloat)
            setInputEnabled(en)
        })

        return () => {
            subscription.unsubscribe()
        }

    }, [inputAddress])

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


    const [flipClicked, setFlipClicked] = useState<boolean>(false)
    //TODO: change after broad estimation
    useEffect(() => {
        if (flipClicked) {
            const inputAddressTemp = inputAddress
            const tempOutputValue = outputValue

            setInputAddress(outputAddress)
            setOutputAddress(inputAddressTemp)

            setTimeout(() => {
                setInputValue(tempOutputValue)
            }, 500)

            setFlipClicked(false)
        }
    }, [flipClicked])

    const priceImpactCallback = useCallback(async () => {
        let impact: number = 0
        const factor = BigInt(10000)
        let spot: number = 0
        if (swapEnabled) {

            setExpectedFee((parseFloat(inputValue) * 0.005).toString())
            const behodler = walletContextProps.contracts.behodler.Behodler2.Behodler2
            const inputAddressToUse = isEthPredicate(inputAddress) ? behodler2Weth : inputAddress
            const outputAddressToUse = isEthPredicate(outputAddress) ? behodler2Weth : outputAddress
            if (isScarcityPredicate(inputAddress)) {
                //  spot = scxFrom
                const tokenSample = BigInt('10000000000')
                const scx = BigInt((await behodler.withdrawLiquidity(outputAddressToUse.toString(), tokenSample.toString()).call(null, { from: account }).catch(err => console.log('impact estimation error ' + err))).toString())
                spot = Number((scx > tokenSample ? (scx * factor) / tokenSample : (tokenSample * factor) / scx)) / 10000
            }
            else if (isScarcityPredicate(outputAddress)) {
                const scxSample = BigInt('10000000000')
                const inputFromScxSample = BigInt((await behodler.withdrawLiquidityFindSCX(inputAddressToUse, '10000', scxSample.toString(), '35').call({ from: account }).catch(err => console.log('error in withdraw ' + JSON.stringify(err)))).toString())
                spot = Number(scxSample > inputFromScxSample ? (scxSample * factor) / inputFromScxSample : (inputFromScxSample * factor) / scxSample) / 10000
            }
            else {
                const scxFromMinInput = BigInt((await behodler.withdrawLiquidityFindSCX(inputAddressToUse, '1000', '1000000000', '15').call({ from: account })).toString())
                const scxFromMinOutput = BigInt((await behodler.withdrawLiquidityFindSCX(outputAddressToUse, '1000', '1000000000', '15').call({ from: account })).toString())
                spot = Number(scxFromMinInput > scxFromMinOutput ? (scxFromMinInput * factor) / scxFromMinOutput : (scxFromMinOutput * factor) / scxFromMinInput) / 10000

            }
            let bigger = Math.max(exchangeRate, spot)
            let smaller = Math.min(exchangeRate, spot)
            impact = 100 * ((bigger - smaller) / bigger)
            // impact = Math.max(0, impact - 0.5)
        }

        setPriceImpact(formatSignificantDecimalPlaces(impact.toString(), 6))

    }, [exchangeRate])

    useEffect(() => {
        priceImpactCallback()
    }, [exchangeRate])

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

    const swapAction = async () => {
        if (swapEnabled) {
            setSwapClicked(true)
            return;
        } else if (!inputEnabled) {
            await API.enableToken(
                inputAddress,
                uiContainerContextProps.walletContext.account || "",
                walletContextProps.contracts.behodler.Behodler2.Behodler2.address, (err, hash: string) => {
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
    const greySwap = inputEnabled && !swapPossible
    const [showMoreInfo, setShowMoreInfo] = useState<boolean>(false)
    const [showMobileInfo, setShowMobileInfo] = useState<boolean>(false)
    const [reserves, setReserves] = useState<string[]>(['', ''])

    const setReservesCallback = useCallback(async () => {
        const inputTokenToload = isEthPredicate(inputAddress) ? behodler2Weth : inputAddress
        const outputTokenToLoad = isEthPredicate(outputAddress) ? behodler2Weth : outputAddress
        const inputToken = await API.getToken(inputTokenToload, walletContextProps.networkName)
        const outputToken = await API.getToken(outputTokenToLoad, walletContextProps.networkName)

        const inputReserve = isScarcityPredicate(inputAddress) ? "" : API.fromWei((await inputToken.balanceOf(walletContextProps.contracts.behodler.Behodler2.Behodler2.address).call({ from: account })).toString())
        const outputReserve = isScarcityPredicate(outputAddress) ? "" : API.fromWei((await outputToken.balanceOf(walletContextProps.contracts.behodler.Behodler2.Behodler2.address).call({ from: account })).toString())
        setReserves([formatSignificantDecimalPlaces(inputReserve, 2), formatSignificantDecimalPlaces(outputReserve, 2)])
    }, [swapEnabled])
    useEffect(() => {
        setReservesCallback()
    }, [swapEnabled])
    const toggleMobileInfo = () => swapEnabled ? setShowMobileInfo(!showMobileInfo) : setShowMobileInfo(false)

    const MoreInfoOverlay = (props: { mobile?: boolean }) => (swapEnabled && (showMoreInfo || showMobileInfo) ? <MoreInfo
        burnFee={formatSignificantDecimalPlaces(expectedFee, 4)}
        inputType={isScarcityPredicate(inputAddress) ? InputType.scx : (inputBurnable ? InputType.burnable : InputType.pyro)}
        priceImpact={`${formatSignificantDecimalPlaces(priceImpact, 2)}`}
        inputTokenName={nameOfSelectedAddress(inputAddress)}
        outputTokenName={nameOfSelectedAddress(outputAddress)}
        mobile={props.mobile || false}
        inputReserve={reserves[0]}
        outputReserve={reserves[1]}
    /> :
        <div></div>)
    return (
        <Box className={classes.root}>
            <Hidden lgUp>
                <div className={classes.mobileContainer} key="mobileContainer">
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
                                    <img width={180} src={swapping ? Images[15] : Images[13]} className={classes.monsterMobile} />
                                </Grid>
                                <Grid item>
                                    <TokenSelector network={networkName} balances={tokenBalances} setAddress={setOutputAddress} tokenImage={fetchToken(outputAddress).image} scale={0.65} mobile />
                                </Grid>
                            </Grid>

                        </Grid>
                        <Grid item key="mobileGridInput">
                            <Grid
                                container
                                direction="column"
                                justify="flex-start"
                                alignItems="stretch"
                                spacing={2}
                                key={'MobilFrom' + "_grid"}
                                className={inputClasses.mobileRoot}
                            >
                                <Grid item>
                                    <Grid container direction="row" spacing={2} justify="space-between" alignItems="center">
                                        <Grid item>
                                            <DirectionLabel direction={"FROM"} /></Grid>
                                        <Grid item>
                                            <div key={"MobileFrom"}>
                                                <input
                                                    id={inputAddress}
                                                    placeholder={nameOfSelectedAddress(inputAddress)}
                                                    value={inputValue}
                                                    onChange={(event) => { setFormattingFrom(event.target.value, inputValid, fromBalance[0].balance) }}
                                                    className={inputClasses.inputNarrow} />
                                            </div>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid item>
                                    <BalanceContainer setValue={setInputValue} balance={formatSignificantDecimalPlaces(fromBalance.length > 0 ? API.fromWei(fromBalance[0].balance) : '0', 4)} token={inputAddress} estimate={inputSpotDaiPriceView} />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item key="mobileGridOutput">
                            <Grid
                                container
                                direction="column"
                                justify="flex-start"
                                alignItems="stretch"
                                spacing={2}
                                key={'MobilTo' + "_grid"}
                                className={inputClasses.mobileRoot}
                            >
                                <Grid item>
                                    <Grid container direction="row" spacing={2} justify="space-between" alignItems="center">
                                        <Grid item>
                                            <DirectionLabel direction={"TO"} /></Grid>
                                        <Grid item>
                                            <div key={"MobileTO"}>
                                                <input
                                                    id={outputAddress}
                                                    placeholder={nameOfSelectedAddress(outputAddress)}
                                                    value={outputValue}
                                                    onChange={(event) => { setFormattingTo(event.target.value, outputValid, toBalance[0].balance) }}
                                                    className={inputClasses.inputNarrow} />
                                            </div>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid item>
                                    <BalanceContainer
                                        setValue={setOutputValue}
                                        balance={formatSignificantDecimalPlaces(toBalance.length > 0 ? API.fromWei(toBalance[0].balance) : '0', 4)}
                                        token={outputAddress}
                                        estimate={outputSpotDaiPriceView} />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item>
                            <Box className={greySwap ? classes.buttonWrapperDisabled : classes.buttonWrapper}>
                                <Button className={greySwap ? classes.swapButtonMobileDisabled : classes.swapButtonMobile} disabled={!swapEnabled && false} variant="contained" color="primary" size="large" onClick={swapAction}>
                                    {swapText}
                                </Button>
                            </Box>
                        </Grid>
                        <Grid item>
                            <div className={classes.flippySwitch} onClick={() => setFlipClicked(true)} />
                        </Grid>
                        <Grid item>
                            <Grid container
                                direction="column"
                                justify="center"
                                alignItems="center"
                                spacing={2}
                                className={classes.Info}
                            >
                                <Grid item className={classes.impliedExchangeRate}>
                                    {impliedExchangeRate}
                                </Grid>
                                <Grid item>
                                    <MoreInfoOverlay mobile />
                                    <Button
                                        color="secondary" variant="outlined"
                                        onClick={() => toggleMobileInfo()}
                                        disabled={!swapEnabled}
                                    >
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
            <Hidden mdDown>

                <Grid container
                    direction="column"
                    justify="center"
                    alignItems="center"
                    className={classes.fieldGrid}
                    key="desktopContainer"
                >
                    <Grid item key="textSection">
                        <Grid
                            container
                            direction="row"
                            justify="center"
                            alignItems="center"
                            spacing={3}
                        >
                            <Grid item key="dekstopGridInput">
                                <Grid
                                    container
                                    direction="column"
                                    justify="flex-start"
                                    alignItems="stretch"
                                    spacing={2}
                                    key={"dekstopGridInput_grid"}
                                    className={inputClasses.root}
                                >
                                    <Grid item>
                                        <div key={"desktopInput"}>
                                            <input
                                                id={inputAddress}
                                                key={"desktopInputInput"}
                                                placeholder={nameOfSelectedAddress(inputAddress)}
                                                value={inputValue}
                                                onChange={(event) => { setFormattingFrom(event.target.value, inputValid, fromBalance[0].balance) }}
                                                className={inputClasses.inputWide} />
                                        </div>
                                    </Grid>
                                    <Grid item>
                                        <BalanceContainer setValue={setInputValue} balance={formatSignificantDecimalPlaces(fromBalance.length > 0 ? API.fromWei(fromBalance[0].balance) : '0', 4)} token={inputAddress} estimate={inputSpotDaiPriceView} />
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item>
                                <Grid
                                    container
                                    direction="row"
                                    justify="space-between"
                                    alignItems="center"
                                    id="central-selector-monster-grid"
                                >
                                    <Grid item>
                                        <TokenSelector balances={tokenBalances} network={networkName} setAddress={setInputAddress} tokenImage={fetchToken(inputAddress).image} scale={0.8} />
                                    </Grid>
                                    <Grid item>
                                        <div className={classes.monsterContainer} >
                                            <Tooltip title={swapping ? "" : "FLIP TOKEN ORDER"} arrow>
                                                <img width={350} src={swapping ? Images[15] : Images[13]} className={classes.monster} onClick={() => setFlipClicked(true)} />
                                            </Tooltip>
                                        </div>
                                    </Grid>
                                    <Grid item>
                                        <TokenSelector balances={tokenBalances} network={networkName} setAddress={setOutputAddress} tokenImage={fetchToken(outputAddress).image} scale={0.8} />
                                    </Grid>
                                </Grid>
                            </Grid>

                            <Grid item key="dekstopGridOuput">
                                <Grid
                                    container
                                    direction="column"
                                    justify="flex-start"
                                    alignItems="stretch"
                                    spacing={2}
                                    key={"dekstopGridOutput_grid"}
                                    className={inputClasses.root}
                                >
                                    <Grid item>
                                        <div key={"desktopOutput"}>
                                            <input
                                                id={outputAddress}
                                                key={"desktopInputOutput"}
                                                placeholder={nameOfSelectedAddress(outputAddress)}
                                                value={outputValue}
                                                onChange={(event) => { setFormattingTo(event.target.value, outputValid, toBalance[0].balance) }}
                                                className={inputClasses.inputWide} />
                                        </div>
                                    </Grid>
                                    <Grid item>
                                        <BalanceContainer
                                            setValue={setOutputValue}
                                            balance={formatSignificantDecimalPlaces(toBalance.length > 0 ? API.fromWei(toBalance[0].balance) : '0', 4)}
                                            token={outputAddress}
                                            estimate={outputSpotDaiPriceView} />
                                    </Grid>
                                </Grid>


                            </Grid>
                        </Grid>

                    </Grid>
                    <Grid item>

                        <Box className={greySwap ? classes.buttonWrapperDisabled : classes.buttonWrapper}>

                            <Button className={greySwap ? classes.swapButtonDisabled : classes.swapButton} disabled={!swapEnabled && false} variant="contained" color="primary" size="large" onClick={() => { if (!greySwap) swapAction() }}>
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
                            <Grid item className={classes.impliedExchangeRate}>
                                {impliedExchangeRate}
                            </Grid>
                            <Grid item className={classes.moreInfo}>
                                <MoreInfoOverlay />
                                <Button color="secondary" variant="outlined"
                                    onMouseOver={() => setShowMoreInfo(true)}
                                    onMouseLeave={() => setShowMoreInfo(false)}
                                    disabled={!swapEnabled}
                                >
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



function DirectionLabel(props: { direction: string }) {
    const classes = inputStyles()
    return <div className={classes.Direction}>
        {props.direction}
    </div>
}


function BalanceContainer(props: { estimate: string, balance: string, token: string, setValue: (v: string) => void }) {
    const classes = inputStyles()
    return <Grid
        container
        direction="row"
        justify="space-between"
        alignItems="center"
        spacing={1}
        className={classes.BalanceContainer}
    >
        <Grid item>
            <Balance setValue={props.setValue} balance={props.balance} token={props.token} />
        </Grid>
        <Grid item>
            <Estimate estimate={props.estimate} />
        </Grid>
    </Grid>
}

const PaddedGridItem = (props: { children?: any }) => {
    const classes = inputStyles()
    return <Grid item className={classes.PaddedGridItem}>
        {props.children}
    </Grid>
}
function Balance(props: { token: string, balance: string, setValue: (v: string) => void }) {
    const classes = inputStyles()
    return <Grid
        container
        direction="row"
        justify="flex-start"
        alignItems="center"

    >
        <PaddedGridItem  ><div className={classes.BalanceLabel}>Balance</div></PaddedGridItem>
        <PaddedGridItem ><div className={classes.BalanceValue}>{props.balance}</div></PaddedGridItem>
        <PaddedGridItem ><Link onClick={() => props.setValue(props.balance)} className={classes.Max}>(MAX)</Link></PaddedGridItem>
    </Grid>
}

function Estimate(props: { estimate: string }) {
    const classes = inputStyles()
    const estimateNum = parseFloat(props.estimate)
    return isNaN(estimateNum) ? <div></div> :
        <div className={classes.estimate}><div className={classes.dollarSign}>~$</div><AmountFormat value={estimateNum} formatType="standard" /></div>
}
