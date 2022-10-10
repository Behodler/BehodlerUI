import React, { useEffect, useCallback, useState, useContext } from 'react'
import { Button, Box, Grid, Hidden, Tooltip, Link } from '@material-ui/core'
import BigNumber from 'bignumber.js'
import { DebounceInput } from 'react-debounce-input';
import { useDebounce } from '@react-hook/debounce'

import tokenListJSON from '../../../../blockchain/behodlerUI/baseTokens.json'
import { WalletContext } from '../../../Contexts/WalletStatusContext'
import { TokenList, Logos } from './ImageLoader'
import API from '../../../../blockchain/ethereumAPI'
import TokenSelector from './TokenSelector'
import { Notification, NotificationType } from './Notification'
import FetchBalances from './FetchBalances'
import { formatSignificantDecimalPlaces } from './jsHelpers'
import AmountFormat from './AmountFormat'
import { useActiveWeb3React } from '../hooks/useActiveWeb3React'
import { MigrateToPyroV3 } from '../PyroV3Migration/MigrateToPyroV3'
import { MigrateToPyroV3Link } from '../PyroV3Migration/MigrateToPyroV3Link';
import { PyroTokensInfo } from './PyroTokensInfo/PyroTokensInfo';
import { TokenBalanceMapping, TokenListItem, SwapState, TXType, PendingTX, FieldState, IndependentField } from './types';
import { useStyles, inputStyles } from './styles';

const Factor = 1000000
const bigFactor = BigInt(Factor)
const ONE = BigInt(1000000000000000000)
const loggingOn: boolean = false

function useLoggedState<T>(initialState: T, logthis?: boolean): [T, (newState: T) => void] {
    const [state, setState] = useState<T>(initialState)
    useEffect(() => {
        if (loggingOn || logthis)
            console.log(`state update: ${JSON.stringify(state)}`)
    }, [state])
    return [state, setState]
}
const imageLoader = (network: string) => {
    let base: TokenListItem[] = []
    let pyro: TokenListItem[] = []
    let dai: string = ''
    tokenListJSON[network].forEach(i => {
        let name = i.name
        const LPposition = i.name.toLowerCase().indexOf('UniV2LP')
        if (LPposition !== -1) {
            name = i.name.substring(0, LPposition)
        }
        if (name.toLowerCase() === 'weth')
            name = 'Eth'

        if (name.toLowerCase() === 'scarcity') {
            return
        }
        if (name.toLowerCase() === 'dai') {
            dai = i.address
            return;
        }
        let imagePair = TokenList.filter(pair => pair.baseToken.name.toLowerCase() === i.name.toLowerCase())[0]

        base.push({ name, address: i.address, image: imagePair.baseToken.image })
        const pyroName = name.toLowerCase() === 'eth' ? 'PyroWeth' : 'Pyro' + name
        pyro.push({ name: pyroName, address: i.pyro, image: imagePair.pyroToken.image })
    })
    return [base, pyro, dai]
}

export default function () {
    const classes = useStyles();
    const inputClasses = inputStyles();
    BigNumber.config({ EXPONENTIAL_AT: 50, DECIMAL_PLACES: 18 });

    const walletContextProps = useContext(WalletContext);
    const { chainId, account: accountAddress, active } = useActiveWeb3React()

    const pyroWethProxy = walletContextProps.contracts.behodler.Behodler2.PyroWeth10Proxy
    const behodler = walletContextProps.contracts.behodler.Behodler2.Behodler2
    const behodlerAddress = behodler.address

    const account = accountAddress || "0x0"
    const networkName = API.networkMapping[(chainId || 0).toString()]
    const behodler2Weth = walletContextProps.contracts.behodler.Behodler2.Weth10.address;

    //NEW HOOKS BEGIN
    const [baseTokenImages, setBaseTokenImages] = useState<TokenListItem[]>(imageLoader(networkName)[0] as TokenListItem[])
    const [pyroTokenImages, setPyroTokenImages] = useState<TokenListItem[]>(imageLoader(networkName)[1] as TokenListItem[])
    const [pendingTXQueue, setPendingTXQueue] = useLoggedState<PendingTX[]>([])
    const [block, setBlock] = useLoggedState<string>("")
    const [showNotification, setShowNotification] = useLoggedState<boolean>(false)
    const [currentTxHash, setCurrentTxHash] = useLoggedState<string>("")
    const [notificationType, setNotificationType] = useLoggedState<NotificationType>(NotificationType.pending)
    const [outstandingTXCount, setOutstandingTXCount] = useLoggedState<number>(0)
    const [baseTokenBalances, setBaseTokenBalances] = useLoggedState<TokenBalanceMapping[]>([])
    const [pyroTokenBalances, setPyroTokenBalances] = useLoggedState<TokenBalanceMapping[]>([])
    const [swapping, setSwapping] = useLoggedState<boolean>(false)
    const [daiAddress, setDaiAddress] = useLoggedState<string>(imageLoader(networkName)[3] as string)
    const [minting, setMinting] = useLoggedState<boolean>(true)
    const [isPyroV3MigrationModalOpen, setIsPyroV3MigrationModalOpen] = useState(false);
    //Estimating SCX from a given number of input tokens is

    const [subscribed, setSubscribed] = useState(true)

    useEffect(() => {
        const results = imageLoader(networkName)
        setBaseTokenImages(results[0] as TokenListItem[])
        setPyroTokenImages(results[1] as TokenListItem[])
        setDaiAddress(results[2] as string)
    }, [walletContextProps.networkName])


    const notify = (hash: string, type: NotificationType) => {
        setCurrentTxHash(hash)
        setNotificationType(type)
        setShowNotification(true)
        setOutstandingTXCount(type === NotificationType.pending ? outstandingTXCount + 1 : outstandingTXCount - 1)
        if (type === NotificationType.pending)
            setSwapping(true)
        else setSwapping(false)
    }
    const balanceCallback = useCallback(async () => {
        const baseBalanceResults = await FetchBalances(account || "0x0", baseTokenImages, networkName)
        let baseBalances: TokenBalanceMapping[] = baseTokenImages.map(t => {
            let hexBalance = baseBalanceResults.results[t.name].callsReturnContext[0].returnValues[0].hex.toString()
            let address = t.address
            let decimalBalance = API.web3.utils.hexToNumberString(hexBalance)
            return { address, balance: decimalBalance, name: t.name }
        })
        const ethBalance = await API.getEthBalance(account || "0x0")
        let ethUpdated = baseBalances.map(b => {
            if (b.address === behodler2Weth) {
                return { ...b, balance: ethBalance }
            }
            return b
        })
        if (JSON.stringify(ethUpdated) !== JSON.stringify(baseTokenBalances) && subscribed) {
            setBaseTokenBalances(ethUpdated)
        }

        const pyroBalanceResults = await FetchBalances(account || "0x0", pyroTokenImages, networkName)
        let pyroBalances: TokenBalanceMapping[] = pyroTokenImages.map(t => {
            let hexBalance = pyroBalanceResults.results[t.name].callsReturnContext[0].returnValues[0].hex.toString()
            let address = t.address
            let decimalBalance = API.web3.utils.hexToNumberString(hexBalance)
            return { address, balance: decimalBalance, name: t.name }
        })
        const stringified = JSON.stringify(pyroBalances)
        if (stringified !== JSON.stringify(pyroTokenBalances) && subscribed) {
            setPyroTokenBalances(pyroBalances)
        }
    }, [block, walletContextProps.initialized, subscribed])

    useEffect(() => {
        const bigBlock = BigInt(block)
        const two = BigInt(2)
        if (bigBlock % two === BigInt(0) && walletContextProps.initialized) {
            balanceCallback()
        }
        return () => setSubscribed(false)
    }, [block, walletContextProps.initialized])

    const fetchBaseToken = (address: string): TokenListItem => baseTokenImages.filter(t => t.address.toLowerCase() === address.toLowerCase())[0]

    const fetchPyroToken = (address: string): TokenListItem => {
        const p = pyroTokenImages.filter(t => t.address.toLowerCase() === address.toLowerCase())[0]
        return p
    }

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
    if (walletContextProps.initialized && block === "") {
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

    const [inputValue, setInputValue] = useLoggedState<string>('')
    const [outputValue, setOutputValue] = useLoggedState<string>('')
    const [swapState, setSwapState] = useLoggedState<SwapState>(SwapState.IMPOSSIBLE)
    const [independentField, setIndependentField] = useDebounce<IndependentField>({
        target: 'FROM',
        newValue: ''
    }, 600)
    const [independentFieldState, setIndependentFieldState] = useLoggedState<FieldState>('dormant')
    const [inputEnabled, setInputEnabled] = useLoggedState<boolean>(false)
    const [inputAddress, setInputAddress] = useLoggedState<string>(tokenListJSON[networkName][0].address)
    const [outputAddress, setOutputAddress] = useLoggedState<string>(tokenListJSON[networkName][0].pyro)
    const [swapText, setSwapText] = useLoggedState<string>("MINT")
    const [impliedExchangeRate, setImpliedExchangeRate] = useLoggedState<string>("")

    const [inputSpotDaiPriceView, setinputSpotDaiPriceView] = useLoggedState<string>("")
    const [outputSpotDaiPriceView, setoutputSpotDaiPriceView] = useLoggedState<string>("")

    const updateIndependentField = (target: 'FROM' | 'TO') => (newValue: string) => {
        setIndependentField({
            target,
            newValue
        })
    }

    useEffect(() => {
        if (independentFieldState === 'dormant') {
            let updating = !isNaN(parseFloat(independentField.newValue))
            if (independentField.target === 'FROM') {
                updating = updating && independentField.newValue !== inputValue
                setInputValue(independentField.newValue)
                setOutputValue(updating ? 'calculating...' : '')
            } else {
                updating = updating && independentField.newValue !== outputValue
                setInputValue(updating ? 'calculating...' : '')
                setOutputValue(independentField.newValue)
            }

            if (swapState !== SwapState.IMPOSSIBLE)
                setSwapState(SwapState.IMPOSSIBLE)

            const newState: FieldState = updating ? 'updating dependent field' : 'dormant'
            setIndependentFieldState(newState)
        }
    }, [independentField.target, independentField.newValue])

    const updateIndependentFromField = updateIndependentField('FROM')
    const updateIndependentToField = updateIndependentField('TO')

    const setFormattedInputFactory = (setValue: (v: string) => void) => (value: string) => {
        setValue(value)
    }

    const setFormattingFrom = setFormattedInputFactory(updateIndependentFromField)
    const setFormattingTo = setFormattedInputFactory(updateIndependentToField)

    const spotPriceCallback = useCallback(async () => {
        if (!daiAddress || daiAddress.length < 3)
            return
        setSwapState(SwapState.IMPOSSIBLE)

        const DAI = await API.getToken(daiAddress, walletContextProps.networkName)
        const daiBalanceOnBehodler = new BigNumber(await DAI.balanceOf(behodlerAddress).call({ from: account }))
        const inputAddressToUse = isInputEth ? behodler2Weth : inputAddress
        const outputAddressToUse = isOutputEth ? behodler2Weth : outputAddress
        if (minting) {
            const inputToken = await API.getToken(inputAddressToUse, walletContextProps.networkName)
            const inputBalanceOnBehodler = await inputToken.balanceOf(behodlerAddress).call({ from: account })
            const inputSpot = daiBalanceOnBehodler.div(inputBalanceOnBehodler).toString()
            setinputSpotDaiPriceView(formatSignificantDecimalPlaces(inputSpot.toString(), 2))

            const intSpot = Math.floor(parseFloat(inputSpot) * Factor)
            const pyroToken = await API.getPyroToken(outputAddress, networkName)
            const redeemRate = BigInt((await pyroToken.redeemRate().call({ from: account })).toString())
            const bigSpot = BigInt(!Number.isNaN(intSpot) ? intSpot : 0)
            const spotForPyro = (redeemRate * bigSpot) / (ONE)
            const outputSpot = parseFloat(spotForPyro.toString()) / Factor
            setoutputSpotDaiPriceView(formatSignificantDecimalPlaces(outputSpot.toString(), 2))
        } else {
            const outputToken = await API.getToken(outputAddressToUse, walletContextProps.networkName)
            const outputBalanceOnBehodler = await outputToken.balanceOf(behodlerAddress).call({ from: account })
            const outputSpot = daiBalanceOnBehodler.div(outputBalanceOnBehodler).toString()
            setoutputSpotDaiPriceView(formatSignificantDecimalPlaces(outputSpot, 2))

            const intSpot = Math.floor(parseFloat(outputSpot) * Factor)
            const pyroToken = await API.getPyroToken(inputAddress, networkName)
            const redeemRate = BigInt((await pyroToken.redeemRate().call({ from: account })).toString())
            const bigSpot = BigInt(!Number.isNaN(intSpot) ? intSpot : 0)
            // const bigSpot = BigInt(intSpot)
            const spotForPyro = (redeemRate * bigSpot) / ONE
            const inputSpot = parseFloat(spotForPyro.toString()) / Factor
            setinputSpotDaiPriceView(formatSignificantDecimalPlaces(inputSpot.toString(), 2))
        }
    }, [inputAddress, outputAddress, daiAddress])

    useEffect(() => {
        if (walletContextProps.initialized) {
            spotPriceCallback()
        }
    }, [inputAddress, outputAddress, daiAddress, walletContextProps.initialized])


    const [swapClicked, setSwapClicked] = useLoggedState<boolean>(false)
    const nameOfSelectedAddress = (input: boolean, minting: boolean) => (address: string) => {
        const useBase = input && minting || !input && !minting
        address = address.toLowerCase()
        return (useBase ? baseTokenImages.find(i => i.address.toLowerCase() === address)?.name : pyroTokenImages.find(i => i.address.toLowerCase() === address)?.name) || ''
    }
    const nameOfSelectedInputAddress = nameOfSelectedAddress(true, minting)
    const nameOfSelectedOutputAddress = nameOfSelectedAddress(false, minting)


    const isTokenPredicateFactory = (tokenName: string) => (address: string) => {
        return (input: boolean) => {
            const name = input ? nameOfSelectedInputAddress(address) : nameOfSelectedOutputAddress(address)
            return (name.toLowerCase() === tokenName.toLowerCase())
        }
    }

    const isInputEth = isTokenPredicateFactory("Eth")(inputAddress)(true)
    const isOutputEth = isTokenPredicateFactory("Eth")(outputAddress)(false)

    const assignCorrectCorrespondingToken = useCallback(async (inputChanged: boolean) => {
        if (inputChanged) {
            if (minting) {
                const tokenPair = tokenListJSON[networkName].filter(t => t.address === inputAddress)[0]
                setOutputAddress(tokenPair.pyro)
            } else {
                const tokenPair = tokenListJSON[networkName].filter(t => t.pyro === inputAddress)[0]
                setOutputAddress(tokenPair.address)
            }
        } else {
            if (minting) {
                const tokenPair = tokenListJSON[networkName].filter(t => t.pyro === outputAddress)[0]
                setInputAddress(tokenPair.address)
            } else {
                const tokenPair = tokenListJSON[networkName].filter(t => t.address === outputAddress)[0]
                setInputAddress(tokenPair.pyro)
            }
        }
    }, [inputAddress, outputAddress])
    useEffect(() => {
        assignCorrectCorrespondingToken(true)
    }, [inputAddress])

    useEffect(() => {
        assignCorrectCorrespondingToken(false)
    }, [outputAddress])

    useEffect(() => {
        if (!inputEnabled) {
            setSwapText('APPROVE ' + nameOfSelectedInputAddress(inputAddress))
        }
        else if (minting) {
            setSwapText('MINT')
        } else {
            setSwapText('REDEEM')
        }
    }, [inputEnabled, inputAddress, outputAddress])

    const currentTokenEffects = walletContextProps.initialized
        ? API.generateNewEffects(inputAddress, account, isInputEth)
        : null

    useEffect(() => {
        if (!currentTokenEffects) {
            return;
        }

        const balance = formatSignificantDecimalPlaces(fromBalance.length > 0 ? API.fromWei(fromBalance[0].balance) : '0', 4)
        if (swapState === SwapState.IMPOSSIBLE)
            setImpliedExchangeRate("")

        let addressToCheck = minting ? outputAddress : inputAddress
        if (isOutputEth)
            addressToCheck = walletContextProps.contracts.behodler.Behodler2.PyroWeth10Proxy.address
        if (isInputEth) {
            setInputEnabled(true)
            return
        }

        const effect = currentTokenEffects.allowance(account, addressToCheck)
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

    }, [inputAddress, outputAddress, swapState, independentFieldState, currentTokenEffects])

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
    const mintHashBack = hashBack(TXType.mintPyro)
    const redeemHashBack = hashBack(TXType.redeemPyro)

    const mintOrRedeem = useCallback(async (
        contract,
        method,
        options,
        valueInWei,
        hashBack,
    ) => {
        return new Promise((resolve, reject) => {
            contract[method](valueInWei)
                .estimateGas(options, async function (error, gas) {
                    if (error) console.error("gas estimation error: " + error);
                    options.gas = gas;
                    const txResult = await contract[method](valueInWei)
                        .send(options, hashBack)
                        .catch(err => {
                            console.log(`${contract}.${method} failed`, err)
                            reject(err)
                        })
                    resolve(txResult)
                })
        })

    }, [])

    const swap2Callback = useCallback(async () => {
        const inputValWei = API.toWei(inputValue)
        const primaryOptions = { from: account, gas: undefined };
        const ethOptions = { from: account, value: inputValWei, gas: undefined };

        console.info("tx invocation initiated.")
        if (swapClicked) {
            const pyroTokenAddress = minting ? outputAddress : inputAddress
            const pyroToken = await API.getPyroToken(pyroTokenAddress, networkName)
            const mintContract = isInputEth ? pyroWethProxy : pyroToken
            const redeemContract = isOutputEth ? pyroWethProxy : pyroToken
            const options = minting && isInputEth ? ethOptions : primaryOptions

            if (minting) {
                await mintOrRedeem(mintContract, 'mint', options, inputValWei, mintHashBack)
            } else {
                await mintOrRedeem(redeemContract, 'redeem', options, inputValWei, redeemHashBack)
            }

            setInputValue('')
            setOutputValue('')
        }
        setSwapClicked(false)
    }, [swapClicked])

    useEffect(() => {
        if (swapClicked) {
            swap2Callback()
        }
    }, [swapClicked])


    const [flipClicked, setFlipClicked] = useLoggedState<boolean>(false)
    const flipClickedCallback = useCallback(async () => {
        let newInputAddress = inputAddress
        if (flipClicked) {
            const inputAddressTemp = inputAddress
            const oldValues = [inputValue, outputValue]
            setInputAddress(outputAddress)
            newInputAddress = outputAddress
            setOutputAddress(inputAddressTemp)
            if (swapState !== SwapState.IMPOSSIBLE) {
                updateIndependentField('FROM')(oldValues[1])
            } else {
                setInputValue("")
                setOutputValue("")
            }
        }
        const inputIsBase = tokenListJSON[networkName].filter(t => t.address.toLowerCase() === newInputAddress.toLowerCase()).length > 0
        setMinting(inputIsBase)

        setFlipClicked(false)
    }, [flipClicked])

    useEffect(() => {
        flipClickedCallback()
    }, [flipClicked])
    const calculateOutputFromInput = async () => {
        const inputValToUse = BigInt(API.toWei(inputValue))
        let outputEstimate, redeemRate
        if (minting) {
            let pyrotokensGeneratedWei
            if (isInputEth) {
                pyrotokensGeneratedWei = bigFactor * BigInt(await walletContextProps.contracts.behodler.Behodler2.PyroWeth10Proxy.calculateMintedPyroWeth(inputValToUse).call({ account }))
            } else {
                const pyroToken = await API.getPyroToken(outputAddress, networkName)
                redeemRate = BigInt(await pyroToken.redeemRate().call({ from: account }))
                pyrotokensGeneratedWei = (inputValToUse * bigFactor * ONE) / redeemRate
            }
            outputEstimate = parseFloat(API.fromWei(pyrotokensGeneratedWei.toString())) / Factor
        } else {
            let baseTokensGeneratedWei
            if (isOutputEth) {
                baseTokensGeneratedWei = await walletContextProps.contracts.behodler.Behodler2.PyroWeth10Proxy.calculateRedeemedWeth(inputValToUse).call({ account })
            } else {
                const pyroToken = await API.getPyroToken(inputAddress, networkName)
                const redeemRate = BigInt(await pyroToken.redeemRate().call({ from: account }))
                baseTokensGeneratedWei = (inputValToUse * redeemRate * BigInt(98)) / (ONE * BigInt(100))
            }
            outputEstimate = parseFloat(API.fromWei(baseTokensGeneratedWei.toString()))
        }

        setOutputValue(formatSignificantDecimalPlaces(outputEstimate, 18))
    }

    const calculateInputFromOutput = async () => {
        const outputValToUse = BigInt(API.toWei(outputValue))
        let inputEstimate, redeemRate
        if (minting) {
            let baseTokensRequired
            if (isInputEth) {
                baseTokensRequired = await walletContextProps.contracts.behodler.Behodler2.PyroWeth10Proxy.calculateRedeemedWeth(outputValToUse).call({ account })
            } else {
                const pyroToken = await API.getPyroToken(outputAddress, networkName)
                redeemRate = BigInt(await pyroToken.redeemRate().call({ from: account }))
                baseTokensRequired = (outputValToUse * redeemRate) / ONE
            }
            inputEstimate = parseFloat(API.fromWei(baseTokensRequired.toString()))
        } else {
            let pyroTokensRequired
            if (isInputEth) {
                pyroTokensRequired = bigFactor * BigInt(await walletContextProps.contracts.behodler.Behodler2.PyroWeth10Proxy.calculateMintedPyroWeth(outputValToUse).call({ account }))
            } else {
                const pyroToken = await API.getPyroToken(inputAddress, networkName)
                const redeemRate = BigInt(await pyroToken.redeemRate().call({ from: account }))
                pyroTokensRequired = (outputValToUse * bigFactor * ONE * BigInt(98)) / (redeemRate * BigInt(100))
            }
            inputEstimate = parseFloat(API.fromWei(pyroTokensRequired.toString())) / Factor
        }

        setInputValue(formatSignificantDecimalPlaces(inputEstimate, 18))
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

            // if (independentField.target === 'FROM')
            //     setOutputValue('invalid input')
            // else
            //     setInputValue('invalid input')

            setSwapState(SwapState.IMPOSSIBLE)
            setIndependentFieldState("dormant")
        }
    }, [independentFieldState, independentField.target, independentField.newValue])

    useEffect(() => {
        independentFieldCallback()
    }, [independentFieldState])

    const setImpliedExchangeRateString = () => {
        let pyroName, baseName, e, connectorPhrase
        let parsedInput = parseFloat(inputValue)
        let parsedOutput = parseFloat(outputValue)
        if (isNaN(parsedInput) || isNaN(parsedOutput)) {
            setImpliedExchangeRate('')
            return
        }
        if (minting) {
            pyroName = pyroTokenBalances.filter(p => p.address.toLowerCase() === outputAddress.toLowerCase())[0].name
            baseName = baseTokenBalances.filter(p => p.address.toLowerCase() === inputAddress.toLowerCase())[0].name

            if (independentField.target === 'FROM') {
                e = parsedOutput / parsedInput
                connectorPhrase = 'can mint'
                setImpliedExchangeRate(`1 ${baseName} ${connectorPhrase} ${formatSignificantDecimalPlaces(e, 5)} ${pyroName}`)
            }
            else {
                e = parsedInput / parsedOutput
                connectorPhrase = 'requires'
                setImpliedExchangeRate(`1 ${pyroName} ${connectorPhrase} ${formatSignificantDecimalPlaces(e, 5)} ${baseName}`)
            }
        }
        else {
            pyroName = pyroTokenBalances.filter(p => p.address.toLowerCase() === inputAddress.toLowerCase())[0].name
            baseName = baseTokenBalances.filter(p => p.address.toLowerCase() === outputAddress.toLowerCase())[0].name

            if (independentField.target === 'FROM') {
                e = parsedOutput / parsedInput
                connectorPhrase = 'can redeem'
                setImpliedExchangeRate(`1 ${pyroName} ${connectorPhrase} ${formatSignificantDecimalPlaces(e, 5)} ${baseName}`)
            }
            else {
                e = parsedInput / parsedOutput
                connectorPhrase = 'can be redeemed for'
                setImpliedExchangeRate(`1 ${baseName} ${connectorPhrase} ${formatSignificantDecimalPlaces(e, 5)} ${pyroName}`)
            }


        }

    }

    const swapValidationCallback = useCallback(async () => {
        if (independentFieldState === "validating swap") {
            try {
                if (!inputEnabled && swapState === SwapState.POSSIBLE) {
                    setSwapState(SwapState.DISABLED)
                }
                else {
                    await validateLiquidityExit()
                    if (validateBalances())
                        setSwapState(SwapState.POSSIBLE)
                    else {
                        setSwapState(SwapState.DISABLED)
                    }
                }
                setImpliedExchangeRateString()
            } catch (e) {
                setSwapState(SwapState.IMPOSSIBLE)
                console.warn('validation failed ' + e)
            }
            setIndependentFieldState("dormant")
        }
    }, [independentFieldState])

    useEffect(() => {
        swapValidationCallback()
    }, [independentFieldState])

    useEffect(() => {
        setIndependentFieldState("validating swap")
    }, [inputEnabled])
    const validateBalances = (): boolean => {
        //check pyrotokens balances
        const balanceOfInput = parseFloat(API.fromWei(
            minting
                ?
                baseTokenBalances.filter(b => b.address === inputAddress)[0].balance
                :
                pyroTokenBalances.filter(b => b.address === inputAddress)[0].balance
        ))
        return (balanceOfInput >= parseFloat(inputValue))
    }

    const validateLiquidityExit = async () => {
        if (!minting) {
            const outputAddressToUse = isOutputEth ? behodler2Weth : outputAddress
            const token = await API.getToken(outputAddressToUse, networkName)
            const reserveBalance = parseFloat(API.fromWei((await token.balanceOf(inputAddress).call({ from: account })).toString()))

            if (reserveBalance < parseFloat(inputValue)) {
                const fieldSet = independentField.target === 'FROM' ? setOutputValue : setInputValue

                fieldSet(` Insufficient ${nameOfSelectedOutputAddress(outputAddress)} reserves`)
                throw "Reserve Insufficient"
            }
        }
    }
    const fromBalance = minting ? baseTokenBalances.filter(t => t.address.toLowerCase() === inputAddress.toLowerCase()) : pyroTokenBalances.filter(t => t.address.toLowerCase() === inputAddress.toLowerCase())
    const toBalance = minting ? pyroTokenBalances.filter(t => t.address.toLowerCase() === outputAddress.toLowerCase()) : baseTokenBalances.filter(t => t.address.toLowerCase() === outputAddress.toLowerCase())

    const swapAction = async () => {
        if (swapState === SwapState.POSSIBLE && inputEnabled) {
            setSwapClicked(true)
            return;
        } else if (!inputEnabled) {
            const addressToUse = isOutputEth ? walletContextProps.contracts.behodler.Behodler2.PyroWeth10Proxy.address : (minting ? outputAddress : inputAddress)
            await API.enableToken(
                inputAddress,
                account || "",
                addressToUse, (err, hash: string) => {
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

    const greySwap = inputEnabled && (swapState === SwapState.DISABLED || swapState === SwapState.IMPOSSIBLE) || swapping
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
    const staticLogo = Logos.filter(l => l.name === 'Pyrotoken')[0]
    const animatedLogo = Logos.filter(l => l.name === 'PyroAnimated')[0]

    if (!(walletContextProps.initialized && accountAddress && active && chainId)) {
        return (
            <Box justifyContent="center" alignItems="center" display="flex" height="100%" color="#ddd">
                Please connect your wallet to use the app
            </Box>
        );
    }

    return (
        <Box className={classes.root}>

            <MigrateToPyroV3
                isMigrationModalOpen={isPyroV3MigrationModalOpen}
                openMigrationModal={() => setIsPyroV3MigrationModalOpen(true)}
                closeMigrationModal={() => setIsPyroV3MigrationModalOpen(false)}
                pyroTokenV2Balances={pyroTokenBalances}
            />

            <Hidden lgUp>
                <div className={classes.mobileContainer} key="mobileContainer">
                    <Grid
                        container
                        direction="column"
                        justifyContent="center"
                        alignItems="center"
                        className={classes.mobileGrid}
                        spacing={3}
                    >
                        <Grid item>
                            <Grid
                                container
                                direction="row"
                                justifyContent="center"
                                alignItems="center"
                                className={`${classes.mobileSelectorGrid} token-selectors-and-monster`}
                            >
                                <Grid item>
                                    <TokenSelector pyro={!minting} network={networkName} setAddress={setNewMenuInputAddress} tokenImage={minting ? fetchBaseToken(inputAddress).image : fetchPyroToken(inputAddress).image}
                                        scale={0.65} mobile balances={minting ? baseTokenBalances : pyroTokenBalances} />
                                </Grid>
                                <Grid item onClick={() => setFlipClicked(true)} >
                                    <img width={100} src={swapping ? animatedLogo.image : staticLogo.image} className={classes.pyroShieldMobileAnimated} />

                                </Grid>
                                <Grid item>
                                    <TokenSelector pyro={minting} network={networkName} balances={minting ? pyroTokenBalances : baseTokenBalances} setAddress={setNewMenuOutputAddress} tokenImage={!minting ? fetchBaseToken(outputAddress).image : fetchPyroToken(outputAddress).image} scale={0.65} mobile />
                                </Grid>
                            </Grid>

                        </Grid>
                        <Grid item key="mobileGridInput">
                            <Grid
                                container
                                direction="column"
                                justifyContent="flex-start"
                                alignItems="stretch"
                                spacing={2}
                                key={'MobilFrom' + "_grid"}
                                className={inputClasses.mobileRoot}
                            >
                                <Grid item>
                                    <Grid container direction="row" spacing={2} justifyContent="space-between" alignItems="center">
                                        <Grid item>
                                            <DirectionLabel direction={"FROM"} /></Grid>
                                        <Grid item>
                                            <div key={"MobileFrom"}>
                                                <DebounceInput
                                                    id={inputAddress}
                                                    debounceTimeout={300}
                                                    placeholder={nameOfSelectedInputAddress(inputAddress)}
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
                        <Grid item>
                            <div
                                className={`${classes.flippySwitch} mobile-flippy-switch`}
                                onClick={() => setFlipClicked(true)}
                            />
                        </Grid>
                        <Grid item key="mobileGridOutput">
                            <Grid
                                container
                                direction="column"
                                justifyContent="flex-start"
                                alignItems="stretch"
                                spacing={2}
                                key={'MobilTo' + "_grid"}
                                className={inputClasses.mobileRoot}
                            >
                                <Grid item>
                                    <Grid container direction="row" spacing={2} justifyContent="space-between" alignItems="center">
                                        <Grid item>
                                            <DirectionLabel direction={"TO"} /></Grid>
                                        <Grid item>
                                            <div key={"MobileTO"}>
                                                <DebounceInput
                                                    debounceTimeout={300}
                                                    id={outputAddress}
                                                    placeholder={nameOfSelectedOutputAddress(outputAddress)}
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

                        <Grid item style={{ marginTop: '20px' }}>
                            <PyroTokensInfo />
                        </Grid>

                        <Grid item>
                            <Box className={greySwap ? classes.buttonWrapperDisabled : classes.buttonWrapper}>
                                <Button
                                    className={greySwap ? classes.swapButtonMobileDisabled : classes.swapButtonMobile}
                                    disabled={swapState === SwapState.IMPOSSIBLE || swapping}
                                    variant="contained" color="primary" size="large"
                                    onClick={swapAction}
                                >
                                    {swapText}
                                </Button>
                            </Box>
                        </Grid>
                        <Grid item>
                            <Grid container
                                direction="column"
                                justifyContent="center"
                                alignItems="center"
                                spacing={2}
                                className={classes.Info}
                            >
                                <Grid item className={classes.impliedExchangeRate}>
                                    {impliedExchangeRate}
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
                    justifyContent="center"
                    alignItems="center"
                    className={classes.fieldGrid}
                    key="desktopContainer"
                >
                    <Grid item key="textSection">
                        <Grid
                            container
                            direction="row"
                            justifyContent="center"
                            alignItems="center"
                            spacing={3}
                        >
                            <Grid item key="dekstopGridInput">
                                <Grid
                                    container
                                    direction="column"
                                    justifyContent="flex-start"
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
                                                placeholder={nameOfSelectedInputAddress(inputAddress)}
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
                                    justifyContent="space-between"
                                    alignItems="center"
                                    id="central-selector-monster-grid"
                                >
                                    <Grid item>
                                        <TokenSelector pyro={!minting} balances={minting ? baseTokenBalances : pyroTokenBalances} network={networkName} setAddress={setNewMenuInputAddress} tokenImage={minting ? fetchBaseToken(inputAddress).image : fetchPyroToken(inputAddress).image} scale={0.8} />
                                    </Grid>
                                    <Grid item>
                                        <div className={classes.pyroShieldContainer} >
                                            <Tooltip title={swapping ? "" : "FLIP TOKEN ORDER"} arrow>
                                                <img width={160} src={swapping ? animatedLogo.image : staticLogo.image} className={classes.pyroShield} onClick={() => setFlipClicked(true)} />

                                            </Tooltip>
                                        </div>
                                    </Grid>
                                    <Grid item>
                                        <TokenSelector pyro={minting} balances={minting ? pyroTokenBalances : baseTokenBalances} network={networkName} setAddress={setNewMenuOutputAddress} tokenImage={minting ? fetchPyroToken(outputAddress).image : fetchBaseToken(outputAddress).image} scale={0.8} />
                                    </Grid>
                                </Grid>
                            </Grid>

                            <Grid item key="dekstopGridOuput">
                                <Grid
                                    container
                                    direction="column"
                                    justifyContent="flex-start"
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
                                                placeholder={nameOfSelectedOutputAddress(outputAddress)}
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

                    <PyroTokensInfo />

                    <Grid item>

                        <Box className={greySwap ? classes.buttonWrapperDisabled : classes.buttonWrapper}>

                            <Button
                                className={greySwap ? classes.swapButtonDisabled : classes.swapButton}
                                disabled={swapState === SwapState.IMPOSSIBLE || swapping}
                                variant="contained" color="primary" size="large"
                                onClick={() => { if (!greySwap) swapAction() }}
                            >
                                {swapText}
                            </Button>

                        </Box>
                    </Grid>
                    <Grid item>
                        <Grid container
                            direction="column"
                            justifyContent="center"
                            alignItems="center"
                            spacing={2}
                            className={classes.Info}
                        >

                            <Grid item className={classes.impliedExchangeRate}>
                                {swapState !== SwapState.IMPOSSIBLE ? impliedExchangeRate : ""}
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Hidden>

            <MigrateToPyroV3Link
                openMigrationModal={() => setIsPyroV3MigrationModalOpen(true)}
                pyroTokenV2Balances={pyroTokenBalances}
            />
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
        justifyContent="space-between"
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
        justifyContent="flex-start"
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
