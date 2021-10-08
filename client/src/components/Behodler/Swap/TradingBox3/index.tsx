import * as React from 'react'
import { useEffect, useCallback, useState, useContext } from 'react'
import { Button, Box, makeStyles, Theme, Grid, Hidden, CircularProgress, Tooltip, Link } from '@material-ui/core'
import tokenListJSON from '../../../../blockchain/behodlerUI/baseTokens.json'
import { WalletContext } from '../../../Contexts/WalletStatusContext'
import { Images } from './ImageLoader'
import BigNumber from 'bignumber.js'
import API from '../../../../blockchain/ethereumAPI'
import TokenSelector from './TokenSelector'
import { Notification, NotificationType } from './Notification'
import FetchBalances from './FetchBalances'
import { assert, formatNumberText, formatSignificantDecimalPlaces } from './jsHelpers'
import MoreInfo, { InputType } from './MoreInfo'
import AmountFormat from './AmountFormat'
import { InputGivenOutput, OutputGivenInput, TradeStatus } from './SwapCalculator'
import { StatelessBehodlerContext, StatelessBehodlerContextProps } from '../EVM_js/context/StatelessBehodlerContext'
import { DebounceInput } from 'react-debounce-input'
import useActiveWeb3React from "../hooks/useActiveWeb3React"
import { useDebounce } from '@react-hook/debounce'

const sideScaler = (scale) => (perc) => (perc / scale) + "%"
const scaler = sideScaler(0.8)
const useStyles = makeStyles((theme: Theme) => ({
    root: {
        margin: '0px auto',
        backgroundColor: 'rgba(255,255,255,0)',
        borderRadius: 20,
        alignContent: "center",
        height: "100%",
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
        margin: "60px -45px 0px -55px",
    },
    monster: {
        display: "block",
        margin: "auto",
        '&:hover': {
            cursor: "pointer"
        },
        // filter: "brightness(0.3)"
        filter: "brightness(1.3)"
    },
    monsterAnimated: {
        display: "block",
        margin: "auto",
        '&:hover': {
            cursor: "pointer"
        },
        filter: "brightness(1.3)",
    },
    monsterMobile: {
        display: "block",
        '&:hover': {
            cursor: "pointer"
        },
        filter: "brightness(1.3)"
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
        maxWidth: '100%',
        width: 400,
    },
    mobileSelectorGrid: {
    },
    mobileContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: '20px',
    },
    flippySwitch: {
        /* Ellipse 18 */
        width: 26,
        height: 26,
        marginTop: -266,
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
    }, flippySwitchSCXWarning: {
        width: 22,
        height: 22,
        marginTop: -350,
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
    },

    transactionFeedbackState: {
        fontSize: 30,
        color: "white"
    },
    moreInfo: {
        position: "relative"
    },
    impliedExchangeRate: {
        minHeight: "30px"
    },
    scxEstimationWarning: {

        width: 400,
        textAlign: "center"
    },
    scxEstimationWarningText: {
        color: "red",
        textShadow: "rgb(200, 200, 200) 1px 1px 30px !important",
        fontSize: scale(20),
        textAlign: "center",
        width: "100%"
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
        fontFamily: "Gilroy",
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

        fontFamily: "Gilroy",
        fontStyle: "normal",
        fontWeight: 600,
        fontSize: scale(16),
        /* identical to box height */

        color: "darkGrey"
    },
    BalanceValue: {

        height: scale(19),

        fontFamily: "Gilroy",
        fontStyle: "normal",
        fontWeight: 600,
        fontSize: scale(16),
        color: "white"
    },
    Max: {
        /* (MAX) */

        height: scale(19),

        fontFamily: "Gilroy",
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

        fontFamily: "Gilroy",
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

        fontFamily: "Gilroy",
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

        fontFamily: "Gilroy",
        fontStyle: "normal",
        fontWeight: 500,
        fontSize: scale(20),
        color: "#FFFFFF",
        outline: 0,
        placeHolder: {
            direction: "rtl"
        }

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

interface IndependentField {
    target: 'TO' | 'FROM'
    newValue: string
}

type FieldState = 'dormant' | 'updating dependent field' | 'validating swap' | 'updating price impact'

enum TradeType {
    SWAP,
    ADD_LIQUIDITY,
    WITHDRAW_LIQUIDITY
}

enum SwapState {
    IMPOSSIBLE,
    DISABLED,
    POSSIBLE
}
const Factor = 1000000
const bigFactor = BigInt(Factor)
const scarcitySwellFactor = 1000000000000
const BigScarcitySwellFactor = BigInt(scarcitySwellFactor)
const ZERO = BigInt(0)

const loggingOn: boolean = false
function useLoggedState<T>(initialState: T): [T, (newState: T) => void] {
    const [state, setState] = useState<T>(initialState)
    useEffect(() => {
        if (loggingOn)
            console.log(`state update: ${JSON.stringify(state)}`)
    }, [state])
    return [state, setState]
}

export default function (props: {}) {
    const classes = useStyles();
    const inputClasses = inputStyles();
    BigNumber.config({ EXPONENTIAL_AT: 50, DECIMAL_PLACES: 18 });

    const walletContextProps = useContext(WalletContext);
    const { chainId, account } = useActiveWeb3React()

    const behodler = walletContextProps.contracts.behodler.Behodler2.Behodler2
    const behodlerAddress = behodler.address
    const statelessBehodler = useContext<StatelessBehodlerContextProps>(StatelessBehodlerContext)

    const networkName = API.networkMapping[(chainId || 0).toString()]
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
            item.address = behodlerAddress
        }
        return item
    })
    const scarcityAddress = tokenDropDownList
        .filter((t) => t.name === 'Scarcity')[0]
        .address.toLowerCase()
        .trim()

    const contracts = tokenDropDownList.map(t => ({ name: t.name, address: t.address }))

    //NEW HOOKS BEGIN
    const [pendingTXQueue, setPendingTXQueue] = useLoggedState<PendingTX[]>([])
    const [block, setBlock] = useLoggedState<string>("")
    const [showNotification, setShowNotification] = useLoggedState<boolean>(false)
    const [currentTxHash, setCurrentTxHash] = useLoggedState<string>("")
    const [notificationType, setNotificationType] = useLoggedState<NotificationType>(NotificationType.pending)
    const [outstandingTXCount, setOutstandingTXCount] = useLoggedState<number>(0)
    const [tokenBalances, setTokenBalances] = useLoggedState<TokenBalanceMapping[]>([])
    const [swapping, setSwapping] = useLoggedState<boolean>(false)
    type scxEstimationWarningMesssage = '' | 'Warning: estimating tokens released from an SCX input can be inaccurate.'
        | 'Warning: estimating tokens required to produce an SCX output can be inaccurate.'
    const [scxEstimationWarning, setScxEstimationWarning] = useLoggedState<scxEstimationWarningMesssage>('')
    //Estimating SCX from a given number of input tokens is

    const notify = (hash: string, type: NotificationType) => {
        setCurrentTxHash(hash)
        setNotificationType(type)
        setShowNotification(true)
        setOutstandingTXCount(type === NotificationType.pending ? outstandingTXCount + 1 : outstandingTXCount - 1)
        if (type === NotificationType.pending)
            setSwapping(true)
        else setSwapping(false)
    }

    const getReserveFactory = (behodler: string) => async (tokenAddress: string) => {
        const token = await API.getToken(tokenAddress, networkName)
        return await token.balanceOf(behodler).call({ from: account })
    }
    const getReserve = getReserveFactory(behodlerAddress)

    const balanceCheck = async (menu: string) => {
        const balanceResults = await FetchBalances(account || "0x0", contracts)
        let balances: TokenBalanceMapping[] = tokenDropDownList.map(t => {
            let hexBalance = balanceResults.results[t.name].callsReturnContext[0].returnValues[0].hex.toString()
            let address = t.address
            let decimalBalance = API.web3.utils.hexToNumberString(hexBalance)
            return { address, balance: decimalBalance }
        })
        const ethBalance = await API.getEthBalance(account || "0x0")
        let ethUpdated = balances.map(b => {
            if (b.address === behodler2Weth) {
                return { ...b, balance: ethBalance }
            }
            return b
        })
        if (JSON.stringify(ethUpdated) !== JSON.stringify(tokenBalances)) {
            setTokenBalances(ethUpdated)
        }
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

    const [inputValue, setInputValue] = useDebounce<string>('', 400)
    const [outputValue, setOutputValue] = useDebounce<string>('', 400)
    const [swapState, setSwapState] = useLoggedState<SwapState>(SwapState.IMPOSSIBLE)
    const [independentField, setIndependentField] = useDebounce<IndependentField>({
        target: 'FROM',
        newValue: ''
    }, 600)
    const [independentFieldState, setIndependentFieldState] = useDebounce<FieldState>('dormant', 600)
    const [inputEnabled, setInputEnabled] = useLoggedState<boolean>(false)
    const [inputAddress, setInputAddress] = useLoggedState<string>(tokenDropDownList[0].address.toLowerCase())
    const [outputAddress, setOutputAddress] = useLoggedState<string>(tokenDropDownList[indexOfScarcityAddress].address.toLowerCase())
    const [swapText, setSwapText] = useLoggedState<string>("SWAP")
    const [impliedExchangeRate, setImpliedExchangeRate] = useLoggedState<string>("")

    const [inputSpotDaiPriceView, setinputSpotDaiPriceView] = useLoggedState<string>("")
    const [outputSpotDaiPriceView, setoutputSpotDaiPriceView] = useLoggedState<string>("")

    const [inputBurnable, setInputBurnable] = useLoggedState<boolean>(false)
    const [expectedFee, setExpectedFee] = useLoggedState<string>("")
    const [priceImpact, setPriceImpact] = useLoggedState<string>("")

    const updateIndependentField = (target: 'FROM' | 'TO') => (newValue: string, update: boolean) => {
        if (target === 'FROM') {
            setInputValue(newValue)
            setOutputValue(update && newValue.trim().length > 0 ? 'estimating...' : '')
        } else {
            setInputValue(update && newValue.trim().length > 0 ? 'estimating...' : '')
            setOutputValue(newValue)
        }

        if (swapState !== SwapState.IMPOSSIBLE)
            setSwapState(SwapState.IMPOSSIBLE)

        setIndependentField({
            target,
            newValue
        })
        const newState: FieldState = update ? 'updating dependent field' : 'dormant'
        setIndependentFieldState(newState)
    }


    const updateIndependentFromField = updateIndependentField('FROM')
    const updateIndependentToField = updateIndependentField('TO')

    const setFormattedInputFactory = (setValue: (v: string, update: boolean) => void) => (value: string) => {
        const formattedText = formatNumberText(value)
        const parsedValue = parseFloat(formattedText)
        const isValid = !isNaN(parsedValue) && parsedValue > 0
        setValue(value, isValid)
    }

    const setFormattingFrom = setFormattedInputFactory(updateIndependentFromField)
    const setFormattingTo = setFormattedInputFactory(updateIndependentToField)

    const getTradeType = () => {
        let type: TradeType
        if (isScarcityPredicate(inputAddress)) {
            type = TradeType.WITHDRAW_LIQUIDITY
        } else if (isScarcityPredicate(outputAddress)) {
            type = TradeType.ADD_LIQUIDITY
        } else {
            type = TradeType.SWAP
        }
        return type;
    }

    const spotPriceCallback = useCallback(async () => {
        setScxEstimationWarning('')
        setSwapState(SwapState.IMPOSSIBLE)
        // setInputValue("")
        // setOutputValue("")
        const daiAddress = tokenDropDownList.filter(d => d.name.toUpperCase() === "DAI")[0].address
        const DAI = await API.getToken(daiAddress, walletContextProps.networkName)
        const daiBalanceOnBehodler = new BigNumber(await DAI.balanceOf(behodlerAddress).call({ from: account }))

        if (isScarcityPredicate(inputAddress)) {
            const scxSpotString = (await behodler.withdrawLiquidityFindSCX(daiAddress, "10000", "10", "25").call({ from: account })).toString()
            const scxSpotPrice = new BigNumber(scxSpotString)
                .div(10)
                .toString()
            setinputSpotDaiPriceView(formatSignificantDecimalPlaces(scxSpotPrice, 2))
        } else {
            const inputToken = await API.getToken(inputAddress, walletContextProps.networkName)
            const inputBalanceOnBehodler = await inputToken.balanceOf(behodlerAddress).call({ from: account })
            const inputSpot = daiBalanceOnBehodler.div(inputBalanceOnBehodler).toString()
            setinputSpotDaiPriceView(formatSignificantDecimalPlaces(inputSpot, 2))
        }

        if (isScarcityPredicate(outputAddress)) {
            const scxSpotString = (await behodler.withdrawLiquidityFindSCX(daiAddress, "10000", "10", "25").call({ from: account })).toString()
            const scxSpotPrice = new BigNumber(scxSpotString)
                .div(10)
                .toString()
            setoutputSpotDaiPriceView(formatSignificantDecimalPlaces(scxSpotPrice, 2))
        }
        else {
            const outputToken = await API.getToken(outputAddress, walletContextProps.networkName)
            const outputBalanceOnBehodler = await outputToken.balanceOf(behodlerAddress).call({ from: account })
            const outputSpot = daiBalanceOnBehodler.div(outputBalanceOnBehodler).toString()
            setoutputSpotDaiPriceView(formatSignificantDecimalPlaces(outputSpot, 2))
        }
    }, [inputAddress, outputAddress])

    useEffect(() => {
        spotPriceCallback()
    }, [inputAddress, outputAddress])

    if (tokenDropDownList.filter((t) => t.address.toLowerCase() === outputAddress.toLowerCase()).length === 0) {
        setOutputAddress(tokenDropDownList[1].address.toLowerCase())
    }
    if (tokenDropDownList.filter((t) => t.address.toLowerCase() === inputAddress.toLowerCase()).length === 0) {
        setInputAddress(tokenDropDownList[0].address.toLowerCase())
    }

    const [swapClicked, setSwapClicked] = useLoggedState<boolean>(false)
    const nameOfSelectedAddress = (address: string) => tokenDropDownList.filter((t) => t.address.toLowerCase() === address.toLowerCase())[0].name

    if (inputAddress === outputAddress) {
        setOutputAddress(tokenDropDownList.filter((t) => t.address !== inputAddress)[0].address)
    }



    const isTokenPredicateFactory = (tokenName: string) => (address: string): boolean =>
        tokenDropDownList.filter((item) => item.address.trim().toLowerCase() === address.trim().toLowerCase())[0].name === tokenName
    const isEthPredicate = isTokenPredicateFactory('Eth')
    const isScarcityPredicate = isTokenPredicateFactory('Scarcity')
    useEffect(() => {
        setScxEstimationWarning('')
    }, [inputAddress, outputAddress])

    const inputBurnableCallback = useCallback(async () => {
        if (isScarcityPredicate(inputAddress)) {
            setInputBurnable(false)
            return;
        }
        const addressToUse = isEthPredicate(inputAddress) ? behodler2Weth : inputAddress
        setInputBurnable((await walletContextProps.contracts.behodler.Behodler2.Lachesis.cut(addressToUse).call({ from: account }))[1])
    }, [inputAddress, swapState])

    useEffect(() => { inputBurnableCallback() }, [inputAddress, swapState])

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
    }, [inputEnabled, inputAddress, outputAddress])

    const currentTokenEffects = API.generateNewEffects(inputAddress, account || "0x0", isEthPredicate(inputAddress))


    useEffect(() => {
        const balance = formatSignificantDecimalPlaces(fromBalance.length > 0 ? API.fromWei(fromBalance[0].balance) : '0', 4)
        setImpliedExchangeRate("")

        if (isEthPredicate(inputAddress) || isScarcityPredicate(inputAddress)) {
            setInputEnabled(true)
            return
        }
        const effect = currentTokenEffects.allowance(account || '0x0', behodlerAddress)
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
        const inputValWei = API.toWei(inputValue)
        const outputValWei = API.toWei(outputValue)
        const primaryOptions = { from: account, gas: undefined };
        const ethOptions = { from: account, value: inputValWei, gas: undefined };

        if (swapClicked) {
            if (inputAddress.toLowerCase() === scarcityAddress) {
                behodler
                    .withdrawLiquidity(outputAddress, outputValWei)
                    .estimateGas(primaryOptions, function (error, gas) {
                        if (error) console.error("gas estimation error: " + error);
                        primaryOptions.gas = gas;
                        behodler.withdrawLiquidity(outputAddress, outputValWei)
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
                    .swap(inputAddress, outputAddress, inputValWei, outputValWei)
                    .estimateGas(options, function (error, gas) {
                        if (error) console.error("gas estimation error: " + error);
                        options.gas = gas;
                        behodler
                            .swap(inputAddress, outputAddress, inputValWei, outputValWei)
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


    const [flipClicked, setFlipClicked] = useLoggedState<boolean>(false)
    useEffect(() => {
        if (flipClicked) {
            const inputAddressTemp = inputAddress
            const oldValues = [inputValue, outputValue]
            const tradeType = getTradeType()
            setInputAddress(outputAddress)
            setOutputAddress(inputAddressTemp)
            if (swapState !== SwapState.IMPOSSIBLE) {
                if (tradeType === TradeType.SWAP || tradeType === TradeType.WITHDRAW_LIQUIDITY) {
                    updateIndependentField('FROM')(oldValues[1], true)
                } else {
                    updateIndependentField('TO')(oldValues[0], true)
                }
            } else {
                setInputValue("")
                setOutputValue("")
            }
        }
        setFlipClicked(false)

    }, [flipClicked])

    const calculateOutputFromInput = async () => {
        const inputAddressToUse = isEthPredicate(inputAddress) ? behodler2Weth : inputAddress
        const outputAddressToUse = isEthPredicate(outputAddress) ? behodler2Weth : outputAddress
        const inputValToUse = API.toWei(inputValue)
        const maxLiquidityExit = BigInt((await behodler.getMaxLiquidityExit().call({ from: account })).toString());
        let outputEstimate, inputReserve, outputReserve
        switch (getTradeType()) {
            case TradeType.ADD_LIQUIDITY:
                setScxEstimationWarning("")
                inputReserve = await getReserve(inputAddressToUse)
                let estimate = await statelessBehodler.addLiquidity(inputValToUse, inputReserve, 5)
                assert(estimate[1].length === 0, estimate[1])
                outputEstimate = estimate[0]
                break;
            case TradeType.WITHDRAW_LIQUIDITY:
                assert(inputValue.trim() !== '0', '')
                outputReserve = await getReserve(outputAddressToUse)
                setScxEstimationWarning("")
                outputEstimate = await statelessBehodler.withdrawLiquidityFindSCX(outputReserve, "100000000", inputValToUse, 25)
                break;
            case TradeType.SWAP:
                setScxEstimationWarning("")
                inputReserve = await getReserve(inputAddressToUse)
                outputReserve = await getReserve(outputAddressToUse)
                let trade = OutputGivenInput(inputReserve, outputReserve, inputValue, maxLiquidityExit)
                if (trade.status === TradeStatus.ReserveOutLow) {
                    throw ('Insufficient liquidity')
                }
                else if (trade.status === TradeStatus.MaxExit) {
                    throw ("Trade too big")
                }
                assert(trade.status === TradeStatus.clean, trade.status)
                outputEstimate = API.fromWei(trade.amountOut.toString())
                break;
        }
        setOutputValue(formatSignificantDecimalPlaces(API.fromWei(outputEstimate), 18))
    }

    const calculateInputFromOutput = async () => {
        const inputAddressToUse = isEthPredicate(inputAddress) ? behodler2Weth : inputAddress
        const outputAddressToUse = isEthPredicate(outputAddress) ? behodler2Weth : outputAddress
        const outputValToUse = API.toWei(outputValue)
        const maxLiquidityExit = BigInt((await behodler.getMaxLiquidityExit().call({ from: account })).toString());
        let inputEstimate, inputReserve, outputReserve
        switch (getTradeType()) {
            case TradeType.ADD_LIQUIDITY:
                inputReserve = await getReserve(inputAddressToUse)
                setScxEstimationWarning("")
                const tokensToRelease = BigInt(inputReserve) / BigInt(2)
                inputEstimate = await statelessBehodler.withdrawLiquidityFindSCX(inputReserve, tokensToRelease.toString(), ((BigInt(outputValToUse) * BigInt(102) / BigInt(100))).toString(), 25)
                break;
            case TradeType.WITHDRAW_LIQUIDITY:
                setScxEstimationWarning("")
                outputReserve = await getReserve(outputAddressToUse)
                const totalSCXSupply = (await behodler.totalSupply().call({ from: account })).toString()
                try {
                    let estimate = await statelessBehodler.withdrawLiquidity(outputValToUse, outputReserve, totalSCXSupply)
                    assert(estimate[1].length === 0, estimate[1])
                    inputEstimate = estimate[0]
                } catch (e) {
                    if ((e as any).reason == "overflow")
                        throw 'BEHODLER: liquidity withdrawal too large.'
                }
                break;
            case TradeType.SWAP:
                setScxEstimationWarning("")
                inputReserve = await getReserve(inputAddressToUse)
                outputReserve = await getReserve(outputAddressToUse)
                let trade = InputGivenOutput(inputReserve, outputReserve, outputValue, maxLiquidityExit)
                if (trade.status === TradeStatus.ReserveOutLow) {
                    throw ('Insufficient liquidity')
                }
                else if (trade.status === TradeStatus.MaxExit) {
                    throw ("Trade too big")
                }
                assert(trade.status === TradeStatus.clean, trade.status)
                inputEstimate = API.fromWei(trade.amountIn.toString())
                break;
        }
        setInputValue(formatSignificantDecimalPlaces(API.fromWei(inputEstimate), 18))
    }

    const independentFieldCallback = useCallback(async () => {
        try {
            if (independentFieldState === "updating dependent field") {
                if (independentField.target === 'FROM') { //changes in input textbox affect output textbox
                    await calculateOutputFromInput()
                } else {
                    await calculateInputFromOutput()
                }
                setIndependentFieldState("validating swap")
            }
        } catch (e) {
            if (independentField.target === 'FROM')
                setOutputValue('invalid input')
            else
                setInputValue('invalid input')

            setSwapState(SwapState.IMPOSSIBLE)
            setIndependentFieldState("dormant")
        }
    }, [independentFieldState])

    useEffect(() => {
        independentFieldCallback()
    }, [independentFieldState])


    const priceImpactCallback = useCallback(async () => {
        if (independentFieldState === "updating price impact") {
            let parsedInput = parseFloat(inputValue)
            const parsedOutput = parseFloat(outputValue)
            setExpectedFee((parsedInput * 0.005).toString())
            // parsedInput *= 0.995
            let exchangeRate = parsedInput / parsedOutput
            let direction: 'IO' | 'OI' = parsedInput > parsedOutput ? 'IO' : 'OI'
            let inputReserve, outputReserve
            if (direction === 'IO') {
                if(isNaN(exchangeRate))
                setImpliedExchangeRate("")
                else{


                const exchangeRateString = formatSignificantDecimalPlaces((exchangeRate).toString(), 6)
                setImpliedExchangeRate(`1 ${nameOfSelectedAddress(outputAddress).toUpperCase()} = ${exchangeRateString} ${nameOfSelectedAddress(inputAddress).toUpperCase()}`)
            }
            } else {
                exchangeRate = parsedOutput / parsedInput
                if(isNaN(exchangeRate)){
                    setImpliedExchangeRate("")
                }else {
                    const exchangeRateString = formatSignificantDecimalPlaces((exchangeRate).toString(), 6)
                    setImpliedExchangeRate(`1 ${nameOfSelectedAddress(inputAddress).toUpperCase()} = ${exchangeRateString} ${nameOfSelectedAddress(outputAddress).toUpperCase()}`)
                }

            }
            const inputAddressToUse = isEthPredicate(inputAddress) ? behodler2Weth : inputAddress
            const outputAddressToUse = isEthPredicate(outputAddress) ? behodler2Weth : outputAddress
            let spotRate = exchangeRate
            switch (getTradeType()) {
                case TradeType.ADD_LIQUIDITY:
                    {
                        inputReserve = await getReserve(inputAddressToUse)
                        const minToken = BigInt("1000000000000000")
                        const spotSCXEstimate = await statelessBehodler.addLiquidity(minToken.toString(), inputReserve, 5)
                        assert(spotSCXEstimate[1].length === 0, 'error estimating price impact: ' + spotSCXEstimate[1])
                        const scxEstimate = BigInt(spotSCXEstimate[0])
                        spotRate = Number((scxEstimate * BigScarcitySwellFactor) / minToken) / scarcitySwellFactor
                    }
                    break;
                case TradeType.WITHDRAW_LIQUIDITY:
                    {
                        outputReserve = await getReserve(outputAddressToUse)
                        const minToken = BigInt("1000000000000000")
                        const scxbalance = tokenBalances.filter(t => isScarcityPredicate(t.address))[0].balance
                        try {
                            const spotSCXEstimate = await statelessBehodler.withdrawLiquidity(minToken.toString(), outputReserve, scxbalance)
                            assert(spotSCXEstimate[1].length === 0, 'error estimating price impact: ' + spotSCXEstimate[1])
                            const scxEstimate = BigInt(spotSCXEstimate[0])
                            spotRate = Number((minToken * bigFactor) / scxEstimate) / Factor
                        } catch (e) {
                            if ((e as any).reason === "overflow") {
                                throw "BEHODLER: liquidity withdrawal too large."
                            }
                        }
                    }
                    break;

                case TradeType.SWAP:
                    inputReserve = BigInt((await getReserve(inputAddressToUse)).toString())
                    outputReserve = BigInt((await getReserve(outputAddressToUse)).toString())
                    spotRate = Number((outputReserve * bigFactor) / inputReserve) / Factor
                    break;
            }

            const exactQuote = spotRate * parsedInput
            const impact = 100 * ((exactQuote - parsedOutput)) / exactQuote
            setPriceImpact(formatSignificantDecimalPlaces(`${impact}`, 6))
            setIndependentFieldState("dormant")
        }
    }, [independentFieldState])

    useEffect(() => {
        priceImpactCallback()
    }, [independentFieldState])

    const swapValidationCallback = useCallback(async () => {
        console.info('swapValidationCallback', {
            inputValue,
            outputValue,
            swapState,
        });

        if (independentFieldState === "validating swap") {
            try {
                if (!inputEnabled && swapState == SwapState.POSSIBLE) {
                    setSwapState(SwapState.DISABLED)
                }
                else {
                    await validateLiquidityExit()

                    if (!inputValue || !outputValue)
                        setSwapState(SwapState.IMPOSSIBLE)
                    else if (validateBalances())
                        setSwapState(SwapState.POSSIBLE)
                    else {
                        setSwapState(SwapState.DISABLED)
                    }
                }
                setIndependentFieldState("updating price impact")
            } catch (e) {
                setSwapState(SwapState.IMPOSSIBLE)
                console.warn('validation failed ' + e)
                setIndependentFieldState("dormant")
            }
        }
        setTimeout(() => {
            console.info('swapState', {
                swapState,
            });
        })
    }, [independentFieldState])

    useEffect(() => {
        setIndependentFieldState("validating swap")
    }, [inputEnabled])

    useEffect(() => {
        swapValidationCallback()
    }, [independentFieldState])

    const validateBalances = (): boolean => {
        const balanceOfInput = parseFloat(API.fromWei(tokenBalances.filter(b => b.address.toLowerCase() === inputAddress.toLowerCase())[0].balance))
        return (balanceOfInput >= parseFloat(inputValue))
    }

    const validateLiquidityExit = async () => {
        if (isScarcityPredicate(outputAddress)) {
            return
        }

        const maxLiquidityExit = BigInt((await behodler.getMaxLiquidityExit().call({ from: account })).toString());
        assert(parseFloat(inputValue) > 0 && parseFloat(outputValue) > 0, 'trade too small')
        const O_i = BigInt(await getReserve(outputAddress))
        const fieldSet = independentField.target === 'FROM' ? setOutputValue : setInputValue

        if (O_i === ZERO && !isScarcityPredicate(outputAddress)) {// division by zero
            fieldSet('insufficient liquidity')
            throw 'exit liquidity zero'
        }

        const bigOutput = BigInt(API.toWei(outputValue))
        const exitRatio = (bigOutput * bigFactor) / (O_i * bigFactor);
        if (exitRatio > maxLiquidityExit) {
            fieldSet('liquidity impact too large')
            throw 'output too large relative to reserve'
        }
    }

    const fromBalance = tokenBalances.filter(t => t.address.toLowerCase() === inputAddress.toLowerCase())
    const toBalance = tokenBalances.filter(t => t.address.toLowerCase() === outputAddress.toLowerCase())

    const swapAction = async () => {
        if (swapState === SwapState.POSSIBLE) {
            setSwapClicked(true)
            return;
        } else if (!inputEnabled) {
            await API.enableToken(
                inputAddress,
                account || "",
                behodler.address, (err, hash: string) => {
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

    const greySwap = inputEnabled && (swapState === SwapState.DISABLED || swapState === SwapState.IMPOSSIBLE)
    const [showMoreInfo, setShowMoreInfo] = useLoggedState<boolean>(false)
    const [showMobileInfo, setShowMobileInfo] = useLoggedState<boolean>(false)
    const [reserves, setReserves] = useLoggedState<string[]>(['', ''])
    const setReservesCallback = useCallback(async () => {
        const inputTokenToload = isEthPredicate(inputAddress) ? behodler2Weth : inputAddress
        const outputTokenToLoad = isEthPredicate(outputAddress) ? behodler2Weth : outputAddress

        const inputReserve = isScarcityPredicate(inputAddress) ? "" : API.fromWei((await getReserve(inputTokenToload)).toString())
        const outputReserve = isScarcityPredicate(outputAddress) ? "" : API.fromWei((await getReserve(outputTokenToLoad)).toString())
        setReserves([formatSignificantDecimalPlaces(inputReserve, 2), formatSignificantDecimalPlaces(outputReserve, 2)])
    }, [swapState])
    useEffect(() => {
        setReservesCallback()
    }, [swapState])
    const toggleMobileInfo = () => swapState !== SwapState.IMPOSSIBLE ? setShowMobileInfo(!showMobileInfo) : setShowMobileInfo(false)

    const MoreInfoOverlay = (props: { mobile?: boolean }) => (swapState !== SwapState.IMPOSSIBLE && (showMoreInfo || showMobileInfo) ? <MoreInfo
        burnFee={formatSignificantDecimalPlaces(expectedFee, 8)}
        inputType={isScarcityPredicate(inputAddress) ? InputType.scx : (inputBurnable ? InputType.burnable : InputType.pyro)}
        priceImpact={`${formatSignificantDecimalPlaces(priceImpact, 2)}`}
        inputTokenName={nameOfSelectedAddress(inputAddress)}
        outputTokenName={nameOfSelectedAddress(outputAddress)}
        mobile={props.mobile || false}
        inputReserve={reserves[0]}
        outputReserve={reserves[1]}
    /> :
        <div></div>)
    const setNewMenuInputAddress = (address: string) => {
        setInputValue("")
        setOutputValue("")
        setInputAddress(address)
    }
    const setNewMenuOutputAddress = (address: string) => {
        setInputValue("")
        setOutputValue("")
        setOutputAddress(address)
    }
    const animating = <img width={290} src={Images[15]} className={classes.monsterAnimated} onClick={() => setFlipClicked(true)} />
    const staticImage = <img width={350} src={Images[13]} className={classes.monster} onClick={() => setFlipClicked(true)} />

    const animatingMobile = <img width={160} src={Images[15]} className={classes.monsterAnimated} onClick={() => setFlipClicked(true)} />
    const staticImageMobile = <img width={180} src={Images[13]} className={classes.monster} onClick={() => setFlipClicked(true)} />
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
                                className={`${classes.mobileSelectorGrid} token-selectors-and-monster`}
                            >
                                <Grid item>
                                    <TokenSelector network={networkName} setAddress={setNewMenuInputAddress} tokenImage={fetchToken(inputAddress).image}
                                        scale={0.65} mobile balances={tokenBalances} />
                                </Grid>
                                <Grid item>
                                    {
                                        swapping ?
                                            animatingMobile
                                            :
                                            staticImageMobile
                                    }
                                </Grid>
                                <Grid item>
                                    <TokenSelector network={networkName} balances={tokenBalances} setAddress={setNewMenuOutputAddress} tokenImage={fetchToken(outputAddress).image} scale={0.65} mobile />
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
                                                <DebounceInput
                                                    id={inputAddress}
                                                    debounceTimeout={300}
                                                    placeholder={nameOfSelectedAddress(inputAddress)}
                                                    value={inputValue}
                                                    onChange={(event) => { setFormattingFrom(event.target.value) }}
                                                    className={inputClasses.inputNarrow} />
                                            </div>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid item>
                                    <BalanceContainer setValue={setFormattingFrom} balance={formatSignificantDecimalPlaces(fromBalance.length > 0 ? API.fromWei(fromBalance[0].balance) : '0', 4)} token={inputAddress} estimate={inputSpotDaiPriceView} />
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
                                                <DebounceInput
                                                    debounceTimeout={300}
                                                    id={outputAddress}
                                                    placeholder={nameOfSelectedAddress(outputAddress)}
                                                    value={outputValue}
                                                    onChange={(event) => { setFormattingTo(event.target.value) }}
                                                    className={inputClasses.inputNarrow} />
                                            </div>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid item>
                                    <BalanceContainer
                                        setValue={setFormattingTo}
                                        balance={formatSignificantDecimalPlaces(toBalance.length > 0 ? API.fromWei(toBalance[0].balance) : '0', 4)}
                                        token={outputAddress}
                                        estimate={outputSpotDaiPriceView} />
                                </Grid>
                            </Grid>
                        </Grid>
                        {scxEstimationWarning.length > 0 ?
                            <Grid item className={classes.scxEstimationWarning}>
                                <div className={classes.scxEstimationWarningText}>
                                    {scxEstimationWarning}
                                </div>
                            </Grid>
                            : <div></div>}
                        <Grid item>
                            <Box className={greySwap ? classes.buttonWrapperDisabled : classes.buttonWrapper}>
                                <Button className={greySwap ? classes.swapButtonMobileDisabled : classes.swapButtonMobile} disabled={swapState === SwapState.IMPOSSIBLE && false} variant="contained" color="primary" size="large" onClick={swapAction}>
                                    {swapText}
                                </Button>
                            </Box>
                        </Grid>
                        <Grid item>
                            <div
                                className={(
                                    scxEstimationWarning.length > 1
                                        ? classes.flippySwitchSCXWarning
                                        : `${classes.flippySwitch} mobile-flippy-switch`
                                )}
                                onClick={() => setFlipClicked(true)}
                            />
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
                                        disabled={swapState === SwapState.IMPOSSIBLE}
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
                                            <DebounceInput
                                                debounceTimeout={300}
                                                id={inputAddress}
                                                key={"desktopInputInput"}
                                                placeholder={nameOfSelectedAddress(inputAddress)}
                                                value={inputValue}
                                                onChange={(event) => { setFormattingFrom(event.target.value) }}
                                                className={inputClasses.inputWide} />
                                        </div>
                                    </Grid>
                                    <Grid item>
                                        <BalanceContainer setValue={setFormattingFrom} balance={formatSignificantDecimalPlaces(fromBalance.length > 0 ? API.fromWei(fromBalance[0].balance) : '0', 4)} token={inputAddress} estimate={inputSpotDaiPriceView} />
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
                                        <TokenSelector balances={tokenBalances} network={networkName} setAddress={setNewMenuInputAddress} tokenImage={fetchToken(inputAddress).image} scale={0.8} />
                                    </Grid>
                                    <Grid item>
                                        <div className={classes.monsterContainer} >
                                            <Tooltip title={swapping ? "" : "FLIP TOKEN ORDER"} arrow>
                                                {swapping ?
                                                    animating
                                                    :
                                                    staticImage
                                                }

                                            </Tooltip>
                                        </div>
                                    </Grid>
                                    <Grid item>
                                        <TokenSelector balances={tokenBalances} network={networkName} setAddress={setNewMenuOutputAddress} tokenImage={fetchToken(outputAddress).image} scale={0.8} />
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
                                            <DebounceInput
                                                id={outputAddress}
                                                debounceTimeout={300}
                                                key={"desktopInputOutput"}
                                                placeholder={nameOfSelectedAddress(outputAddress)}
                                                value={outputValue}
                                                onChange={(event) => { setFormattingTo(event.target.value) }}
                                                className={inputClasses.inputWide} />
                                        </div>
                                    </Grid>
                                    <Grid item>
                                        <BalanceContainer
                                            setValue={setFormattingTo}
                                            balance={formatSignificantDecimalPlaces(toBalance.length > 0 ? API.fromWei(toBalance[0].balance) : '0', 4)}
                                            token={outputAddress}
                                            estimate={outputSpotDaiPriceView} />
                                    </Grid>
                                </Grid>


                            </Grid>
                        </Grid>

                    </Grid>
                    {scxEstimationWarning.length > 0 ?
                        <Tooltip title="For an accurate estimate, edit the other token amount">
                            <Grid item className={classes.scxEstimationWarning}>
                                <div className={classes.scxEstimationWarningText}>
                                    {scxEstimationWarning}
                                </div>
                            </Grid>
                        </Tooltip> : <div></div>}
                    <Grid item>

                        <Box className={greySwap ? classes.buttonWrapperDisabled : classes.buttonWrapper}>

                            <Button className={greySwap ? classes.swapButtonDisabled : classes.swapButton} disabled={swapState === SwapState.IMPOSSIBLE && false} variant="contained" color="primary" size="large" onClick={() => { if (!greySwap) swapAction() }}>
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
                                {swapState !== SwapState.IMPOSSIBLE ? impliedExchangeRate : ""}
                            </Grid>
                            <Grid item className={classes.moreInfo}>
                                <MoreInfoOverlay />
                                <Button color="secondary" variant="outlined"
                                    onMouseOver={() => setShowMoreInfo(true)}
                                    onMouseLeave={() => setShowMoreInfo(false)}
                                    disabled={swapState === SwapState.IMPOSSIBLE}
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
