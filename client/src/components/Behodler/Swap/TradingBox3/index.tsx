import React, { useEffect, useCallback, useState, useReducer } from 'react'
import { Button, Box, Grid, Hidden, Tooltip } from '@material-ui/core'
import BigNumber from 'bignumber.js'
import { DebounceInput } from 'react-debounce-input';
// import { useDebounce } from '@react-hook/debounce'

import API from '../../../../blockchain/ethereumAPI'
import { useActiveWeb3React } from '../hooks/useActiveWeb3React'
import { MigrateToPyroV3 } from '../PyroV3Migration/MigrateToPyroV3'
import { MigrateToPyroV3Link } from '../PyroV3Migration/MigrateToPyroV3Link';
import { useLoggedState } from "../hooks/useLoggedState";
import { useCurrentBlock } from "../hooks/useCurrentBlock";
import { useTXQueue } from "../hooks/useTXQueue";
import { useWalletContext } from "../hooks/useWalletContext";
import { useBehodlerContract, usePyroWeth10ProxyContract, useWeth10Contract } from "../hooks/useContracts";
import _ from 'lodash'
import { useActiveAccountAddress } from "../hooks/useAccount";

import { Notification, NotificationType, useShowNotification } from './components/Notification'
import { PyroTokensInfo } from './components/PyroTokensInfo';
import { BalanceContainer } from './components/BalanceContainer';
import { DirectionLabel } from './components/DirectionLabel';
import { useStyles, inputStyles } from './styles';
import { SwapState, TXType, PendingTX, FieldState, CoherentModel, actions, getPayloadValue } from './types';
import TokenSelector from './TokenSelector'
import { formatSignificantDecimalPlaces } from './jsHelpers'
import { Logos } from './ImageLoader'
import { TokenTripletRow, daiAtom, rowsAtom } from '../hooks/useTokenRows';
import { useAtom } from 'jotai';

BigNumber.config({ EXPONENTIAL_AT: 50, DECIMAL_PLACES: 18 });

const Factor = 1000000
const bigFactor = BigInt(Factor)
const ONE = BigInt(1000000000000000000)

//using undefined coupled with boolean can lead to false negatives


function reducer(state: CoherentModel, action: actions): CoherentModel {
    let newState: CoherentModel = { ...state };
    const itemsToPrint: string[] = []
    if (action.debug) {
        if (action.debug.final && !state.finalized) {
            itemsToPrint.push('final action:')
            itemsToPrint.push(JSON.stringify(action, null, 2))
            newState.finalized = true
        }
    }
    if (state.finalized) {
        return state
    }
    if (action.payload?.debug?.log) {
        itemsToPrint.push(JSON.stringify(action, null, 4))
    }
    switch (action.type) {
        case 'SPOTPRICE':
            newState.inputSpotDaiPriceView = getPayloadValue("string", action.payload.inputSpotDaiPriceView);
            newState.outputSpotDaiPriceView = getPayloadValue("string", action.payload.outputSpotDaiPriceView);
            newState.swapState = getPayloadValue("number", action.payload.swapState);
            break;
        case 'SET_FLIP_CLICKED':
            newState.flipClicked = getPayloadValue("boolean", action.payload.flipClicked);
            break;
        case 'UPDATE_DEPENDENT_FIELD':
            newState.inputText = getPayloadValue("string", action.payload.inputText);
            newState.outputText = getPayloadValue("string", action.payload.outputText);
            newState.swapState = getPayloadValue("number", action.payload.swapState);
            newState.independentFieldState = getPayloadValue("string", action.payload.fieldState);
            break;
        case 'UPDATE_INDEPENDENT_FIELD':
            newState.independentField = {
                target: getPayloadValue(action.payload.target, action.payload.target),
                newValue: getPayloadValue("string", action.payload.newValue)
            };
            break;

        case 'SET_INPUT_ENABLED':
            newState.inputEnabled = getPayloadValue("boolean", action.payload.newValue);
            break;
        case 'UPDATE_SWAP_STATE':
            newState.swapState = getPayloadValue("number", action.payload.newState);
            break;
        case 'SET_SWAP_CLICKED':
            newState.swapClicked = getPayloadValue("boolean", action.payload.swapClicked);
            break;
        case 'UPDATE_INPUT_TEXT':
            newState.inputText = getPayloadValue("string", action.payload.inputText);
            break;
        case 'UPDATE_OUTPUT_TEXT':
            newState.outputText = getPayloadValue("string", action.payload.outputText);
            break;
        case 'UPDATE_MINTING':
            newState.minting = getPayloadValue("boolean", action.payload.minting);
            break;

        case 'UPDATE_INDEPENDENT_FIELD_STATE':
            newState.independentFieldState = getPayloadValue("string", action.payload.fieldState);
            break;
        case 'UPDATE_ADDRESS_PAIR':
            //note to dev: do not delete this console.log. It's for the end user
            itemsToPrint.push('Input Address: ' + action.payload.input);
            itemsToPrint.push('Ouput Address: ' + action.payload.output);
            newState.inputAddress = getPayloadValue("string", action.payload.input);
            newState.outputAddress = getPayloadValue("string", action.payload.output);
            break;
        case 'SET_IMPLIED_EXCHANGE_RATE':
            newState.impliedExchangeRate = getPayloadValue("string", action.payload.impliedExchangeRate);
            break;
        case 'BATCH_UPDATE':
            newState = action.payload;
            break;
        default:
            throw 'unaccounted for action type: ' + action.type;
    }
    itemsToPrint.forEach(i => console.log('REDUCER> ' + i))
    // Only return new state if it's different from the current state
    return JSON.stringify(state) === JSON.stringify(newState) ? state : newState;
}

const preDispatch = (existing: CoherentModel) => (actions: actions[]): CoherentModel => {
    let newState = { ...existing }
    let actionsToExecute: actions[] = []
    for (let i = 0; i < actions.length; i++) {
        actionsToExecute.push(actions[i])
        if (actions[i].debug?.final)
            break;
    }
    console.log('compressing the actions ' + actionsToExecute.map(a => `${a.type}: ${JSON.stringify(a.payload)}`).join('\n '))
    for (let i = 0; i < actions.length; i++) {
        newState = reducer(newState, actions[i])
    }
    return newState
}

let initialState: CoherentModel = {
    inputEnabled: false,
    inputAddress: '',
    outputAddress: '',
    independentField: {
        target: 'TO',
        newValue: ''
    },
    independentFieldState: "dormant",
    inputText: '',
    outputText: '',
    swapState: SwapState.IMPOSSIBLE,
    minting: true,
    inputSpotDaiPriceView: '',
    outputSpotDaiPriceView: '',
    swapClicked: false,
    impliedExchangeRate: '',
    flipClicked: false,
    finalized: false,
}


export default function () {
    const classes = useStyles();
    const inputClasses = inputStyles();
    const isMinting = () => {
        return viewModel.minting
    }
    const { networkName, initialized, contracts } = useWalletContext();
    const { chainId, active } = useActiveWeb3React()
    const [rows,] = useAtom(rowsAtom)
    const [daiAddress,] = useAtom(daiAtom)

    const activeAccountAddress = useActiveAccountAddress()

    initialState.inputAddress = rows[0].base.address
    initialState.outputAddress = rows[0].PV3.address


    const pyroWethProxy = usePyroWeth10ProxyContract()
    const behodler = useBehodlerContract()
    const weth10 = useWeth10Contract()

    const block = useCurrentBlock()
    const showNotification = useShowNotification()

    const [swapping, setSwapping] = useLoggedState<boolean>(false)
    const [isPyroV3MigrationModalOpen, setIsPyroV3MigrationModalOpen] = useState(false);


    const [viewModel, dispatch] = useReducer(reducer, initialState)
    const [activeRow, setActiveRow] = useState<TokenTripletRow>(rows[0])
    const hasV2Balance = BigInt(activeRow.PV2.balance) > 10000n

    useEffect(() => {
        if (!isNaN(parseFloat(viewModel.inputText))) {
            const inputValWei = API.toWei(viewModel.inputText)
            const bigInputValWei = BigInt(inputValWei)

            var allowance = viewModel.minting ? activeRow.PV3.mintAllowance :
                (hasV2Balance ? activeRow.PV2.redeemAllowance : activeRow.PV3.redeemAllowance)
            const bigAllowance = BigInt(allowance)
            const newEnabled = bigAllowance >= bigInputValWei
            if (newEnabled != viewModel.inputEnabled) {
                dispatch({
                    type: 'SET_INPUT_ENABLED',
                    payload: {
                        newValue: newEnabled
                    }
                })
            }
        }
    }, [viewModel.inputText, rows])


    const dispatchMany = (actions: actions[], model: CoherentModel) => {
        const newModel = preDispatch(model)(actions)
        dispatch({ type: 'BATCH_UPDATE', payload: newModel })
    }



    const inputEnabled = viewModel.minting ? BigInt(activeRow.PV3.mintAllowance) > 0 :
        (hasV2Balance ?
            BigInt(activeRow.PV2.redeemAllowance) > 0 : BigInt(activeRow.PV3.redeemAllowance) > 0
        )


    const notify = (hash: string, type: NotificationType) => {
        showNotification(type, hash, () => {
            setSwapping(type === NotificationType.pending)
        })
    }

    const { queueUpdateCallback, txQueuePush } = useTXQueue(notify)


    useEffect(() => {
        queueUpdateCallback()
    }, [block])

    const [swapText, setSwapText] = useLoggedState<string>("MINT")

    useEffect(() => {
        if (viewModel.independentFieldState === 'dormant') {
            const independentFieldNumericValue = parseFloat(viewModel.independentField.newValue);
            const independentFieldContainsOnlyDigitsAndDot = /^[\d\.]+$/g.test(viewModel.independentField.newValue);
            const isEmptyIndependentFieldInput = viewModel.independentField.newValue === ''
            const isValidIndependentFieldInput = isEmptyIndependentFieldInput || (
                !Number.isNaN(independentFieldNumericValue)
                && independentFieldNumericValue > 0
                && independentFieldContainsOnlyDigitsAndDot
            )
            const independentFieldTargetIsFrom = viewModel.independentField.target === 'FROM'

            const updating = independentFieldTargetIsFrom
                ? isValidIndependentFieldInput && viewModel.independentField.newValue !== viewModel.inputText
                : isValidIndependentFieldInput && viewModel.independentField.newValue !== viewModel.outputText

            const outputMessage = (!isEmptyIndependentFieldInput && updating && 'calculating...')
                || (!isValidIndependentFieldInput && 'invalid input')
                || ''
            const newInputText = independentFieldTargetIsFrom ? viewModel.independentField.newValue : outputMessage
            const newOutputText = independentFieldTargetIsFrom ? outputMessage : viewModel.independentField.newValue


            const newSwapState = viewModel.swapState !== SwapState.IMPOSSIBLE ? SwapState.IMPOSSIBLE : viewModel.swapState

            const newfieldState: FieldState = updating ? 'updating dependent field' : 'dormant'

            const action: actions = {
                type: 'UPDATE_DEPENDENT_FIELD',
                payload: {
                    inputText: newInputText,
                    outputText: newOutputText,
                    swapState: newSwapState,
                    fieldState: newfieldState,
                }
            }

            dispatch(action)
        }
    }, [viewModel.independentField.target, viewModel.independentField.newValue])


    const updateIndependentField = (target: 'FROM' | 'TO') => async (value: string) => {
        const action: actions = {
            type: 'UPDATE_INDEPENDENT_FIELD',
            payload: { target, newValue: value }
        }
        dispatch(action)
    }
    const updateIndependentFromField = updateIndependentField('FROM')
    const updateIndependentToField = updateIndependentField('TO')


    const setFormattedInputFactory = (setValue: (v: string) => void) => (value: string) => {
        setValue(value)
    }

    const setFormattingFrom = setFormattedInputFactory(updateIndependentFromField)
    const setFormattingTo = setFormattedInputFactory(updateIndependentToField)

    const spotPriceCallback = useCallback(async () => {
        if (!daiAddress || daiAddress.length < 3 /*|| (viewModel.V2BalanceState === V2BalanceState.unset)*/)
            return

        const payload = {
            swapState: SwapState.IMPOSSIBLE,
            inputSpotDaiPriceView: '',
            outputSpotDaiPriceView: '',
        }

        try {
            const DAI = await API.getToken(daiAddress)
            const daiBalanceOnBehodler = new BigNumber(await DAI.balanceOf(behodler.address).call({ from: activeAccountAddress }))
            const inputToUse = isInputEth ? weth10.address : viewModel.inputAddress
            const outputToUse = isOutputEth ? weth10.address : viewModel.outputAddress
            if (isMinting()) {
                const inputToken = await API.getToken(inputToUse)
                const inputBalanceOnBehodler = await inputToken.balanceOf(behodler.address).call({ from: activeAccountAddress })
                const inputSpot = daiBalanceOnBehodler.div(inputBalanceOnBehodler).toString()
                payload.inputSpotDaiPriceView = formatSignificantDecimalPlaces(inputSpot.toString(), 2)

                const intSpot = Math.floor(parseFloat(inputSpot) * Factor)
                //Don't allow minting of V2
                const pyroToken = await API.getPyroTokenV3(viewModel.outputAddress)
                const redeemRate = BigInt((await pyroToken.redeemRate().call({ from: activeAccountAddress })).toString())
                const bigSpot = BigInt(!Number.isNaN(intSpot) ? intSpot : 0)
                const spotForPyro = (redeemRate * bigSpot) / (ONE)
                const outputSpot = parseFloat(spotForPyro.toString()) / Factor
                payload.outputSpotDaiPriceView = formatSignificantDecimalPlaces(outputSpot.toString(), 2)
            } else {
                const outputToken = await API.getToken(outputToUse)
                const outputBalanceOnBehodler = await outputToken.balanceOf(behodler.address).call({ from: activeAccountAddress })
                const outputSpot = daiBalanceOnBehodler.div(outputBalanceOnBehodler).toString()
                payload.outputSpotDaiPriceView = formatSignificantDecimalPlaces(outputSpot, 2)
                const intSpot = Math.floor(parseFloat(outputSpot) * Factor)

                //Don't allow redeeming of V3 until all V2 is redeemed for a given token.
                //We're nudging everyone off the V2 cliff into the ocean of V3 via UX
                //like one of those annoying facebook feature updates you didn't ask for.
                const pyroTokenV2 = await API.getPyroTokenV2(viewModel.inputAddress, isMinting())
                const pyroTokenV3 = await API.getPyroTokenV3(viewModel.inputAddress, isMinting())

                const redeemRateFunction = (await hasV2Balance) ? pyroTokenV2.redeemRate : pyroTokenV3.redeemRate
                const redeemString = (await redeemRateFunction().call({ from: activeAccountAddress })).toString()
                const redeemRate = BigInt(redeemString)
                const bigSpot = BigInt(!Number.isNaN(intSpot) ? intSpot : 0)
                // const bigSpot = BigInt(intSpot)
                const spotForPyro = (redeemRate * bigSpot) / ONE
                const inputSpot = parseFloat(spotForPyro.toString()) / Factor
                payload.inputSpotDaiPriceView = formatSignificantDecimalPlaces(inputSpot.toString(), 2)
            }
            let action: actions = {
                type: 'SPOTPRICE',
                payload
            }
            dispatch(action)
        } catch (e) {
            console.error(e)
            return
        }
    }, [daiAddress])

    useEffect(() => {
        if (initialized) {
            spotPriceCallback()
        }
    }, [daiAddress, initialized])


    const nameOfSelectedAddress = (input: boolean) => {
        if (input) {
            if (isMinting()) {
                return activeRow.base.name
            } else {
                return hasV2Balance ? activeRow.PV2.name : activeRow.PV3.name
            }
        } else {
            if (isMinting()) {
                return activeRow.PV3.name
            } else {
                return activeRow.base.name
            }
        }
    }

    const nameOfSelectedInput = nameOfSelectedAddress(true)//nameOfSelectedAddress(true, isMinting(), hasV2Balance)
    const nameOfSelectedOutput = nameOfSelectedAddress(false)//nameOfSelectedAddress(false, isMinting(), hasV2Balance)


    const isTokenPredicateFactory = (tokenName: string) => (address: string) => {
        return (input: boolean) => {
            const name = input ? nameOfSelectedInput : nameOfSelectedOutput
            return (name.toLowerCase() === tokenName.toLowerCase())
        }
    }

    const isInputEth = isTokenPredicateFactory("Eth")(viewModel.inputAddress)(true)
    const isOutputEth = isTokenPredicateFactory("Eth")(viewModel.outputAddress)(false)

    useEffect(() => {
        if (!inputEnabled) {
            setSwapText('APPROVE ' + nameOfSelectedInput)
        }
        else if (isMinting()) {
            setSwapText('MINT')
        } else {
            setSwapText('REDEEM')
        }
    }, [inputEnabled, viewModel.inputAddress, viewModel.outputAddress])

    const currentTokenEffects = initialized
        ? API.generateNewEffects(viewModel.inputAddress, activeAccountAddress, isInputEth)
        : null

    useEffect(() => {
        if (!currentTokenEffects) {
            return;
        }
        if (viewModel.swapState === SwapState.IMPOSSIBLE) {
            dispatch({
                type: 'SET_IMPLIED_EXCHANGE_RATE',
                payload: {
                    impliedExchangeRate: ''
                }
            })
        }
    }, [viewModel.inputAddress, viewModel.outputAddress, viewModel.swapState, viewModel.independentFieldState, currentTokenEffects, rows, activeRow])

    const hashBack = (type: TXType) => (err, hash: string) => {
        if (hash) {
            let t: PendingTX = {
                hash,
                type,
                token1: viewModel.inputAddress,
                token2: viewModel.outputAddress,
            }
            txQueuePush(t)
            notify(hash, NotificationType.pending)
        } else {
            notify(hash, NotificationType.rejected)
        }
    }
    const mintHashBack = hashBack(TXType.mintPyro)
    const redeemHashBack = hashBack(TXType.redeemPyro)

    const broadCast = useCallback(async (
        contract,
        method,
        options,

        hashBack,
        ...inputParams: any[]
    ) => {
        //Note, for PyroV3, there's an initial param of mintTo address
        return new Promise((resolve, reject) => {
            contract[method](...inputParams)
                .estimateGas(options, async function (error, gas) {
                    if (error) console.error("gas estimation error: " + error);
                    options.gas = gas;
                    const txResult = await contract[method](...inputParams)
                        .send(options, hashBack)
                        .catch(reject)
                    resolve(txResult)
                })
        })

    }, [])

    const swap2Callback = useCallback(async () => {
        const inputValWei = API.toWei(viewModel.inputText)
        const primaryOptions = { from: activeAccountAddress, gas: undefined };
        const ethOptions = { from: activeAccountAddress, value: inputValWei, gas: undefined };
        if (viewModel.swapClicked) {
            const pyroTokenAddress = isMinting() ? viewModel.outputAddress : viewModel.inputAddress
            const pyroToken = isMinting() ? await API.getPyroTokenV3(pyroTokenAddress)
                : (hasV2Balance ? await API.getPyroTokenV2(pyroTokenAddress) : await API.getPyroTokenV3(pyroTokenAddress))
            const mintContract = isInputEth ? pyroWethProxy : pyroToken
            const redeemContract = isOutputEth ? pyroWethProxy : pyroToken
            const options = isMinting() && isInputEth ? ethOptions : primaryOptions

            try {
                if (isMinting()) {

                    await broadCast(mintContract, 'mint', options, mintHashBack, activeAccountAddress, inputValWei)
                } else {
                    if (hasV2Balance) {
                        await broadCast(redeemContract, 'redeem', options, redeemHashBack, inputValWei)
                    }
                    else { await broadCast(redeemContract, 'redeem', options, redeemHashBack, activeAccountAddress, inputValWei) }

                }

                dispatch({
                    type: 'UPDATE_SWAP_STATE',
                    payload: {
                        newState: SwapState.IMPOSSIBLE
                    }
                })
                dispatch({
                    type: 'UPDATE_INDEPENDENT_FIELD',
                    payload: {
                        target: 'FROM',
                        newValue: ''
                    }
                })
            } catch (e) {
                console.error(e);
            }
        }
        dispatch({
            type: 'SET_SWAP_CLICKED',
            payload: {
                swapClicked: false
            }
        })
    }, [viewModel.swapClicked])

    useEffect(() => {
        if (viewModel.swapClicked) {
            swap2Callback()
        }
    }, [viewModel.swapClicked])

    useEffect(() => {

        const flipClickedCallback = async () => {
            let queue: actions[] = []
            if (viewModel.flipClicked) {
                queue.push({
                    type: 'SET_FLIP_CLICKED', payload: { flipClicked: false }, debug: {
                        final: false
                    }
                })
                queue.push({
                    type: 'UPDATE_MINTING',
                    payload: {
                        minting: !isMinting()
                    }
                })
                queue.push({
                    type: 'UPDATE_INDEPENDENT_FIELD_STATE',
                    payload: {
                        fieldState: 'dormant'
                    }
                })
                //MINTING switching to REDEEMING
                if (isMinting()) {
                    const newInputAddress = hasV2Balance ?
                        await contracts.behodler.Behodler2.LiquidityReceiverV2.baseTokenMapping(viewModel.inputAddress).call()
                        : viewModel.outputAddress

                    queue.push({
                        type: 'UPDATE_ADDRESS_PAIR',
                        payload: {
                            input: newInputAddress,
                            output: viewModel.inputAddress
                        }
                    })

                    queue.push({
                        type: 'UPDATE_OUTPUT_TEXT',
                        payload: {
                            outputText: ''
                        },
                    })
                    queue.push({
                        type: 'UPDATE_INDEPENDENT_FIELD',
                        payload: {
                            target: 'TO',
                            newValue: viewModel.inputText
                        },
                    })
                } else { //REDEEMING switchig to MINTING
                    const pyroV3Address = await contracts.behodler.Behodler2.LiquidityReceiverV3.getPyroToken(viewModel.outputAddress).call();


                    queue.push({
                        type: 'UPDATE_ADDRESS_PAIR',
                        payload: {
                            input: viewModel.outputAddress,
                            output: pyroV3Address
                        }
                    })

                    queue.push({
                        type: 'UPDATE_INPUT_TEXT',
                        payload: {
                            inputText: ''
                        },
                    })
                    queue.push({
                        type: 'UPDATE_INDEPENDENT_FIELD',
                        payload: {
                            target: 'FROM',
                            newValue: viewModel.outputText
                        },
                    })
                }

                if (viewModel.swapState == SwapState.IMPOSSIBLE) {
                    queue.push({
                        type: 'UPDATE_INPUT_TEXT',
                        payload: {
                            inputText: ''
                        }
                    })
                    queue.push({
                        type: 'UPDATE_OUTPUT_TEXT',
                        payload: {
                            outputText: ''
                        }
                    })

                }

            }
            dispatchMany(queue, viewModel)
        }
        if (viewModel.flipClicked)
            flipClickedCallback()

    }, [viewModel.flipClicked])

    const calculateOutputFromInput = async () => {
        const inputValToUse = BigInt(API.toWei(viewModel.inputText))
        let outputEstimate, redeemRate

        if (isMinting()) {
            let pyrotokensGeneratedWei
            const pyroToken = await API.getPyroTokenV3(viewModel.outputAddress)
            redeemRate = BigInt(await pyroToken.redeemRate().call({ from: activeAccountAddress }))
            pyrotokensGeneratedWei = (inputValToUse * bigFactor * ONE) / redeemRate

            outputEstimate = parseFloat(API.fromWei(pyrotokensGeneratedWei.toString())) / Factor
        } else {
            let baseTokensGeneratedWei
            if (isOutputEth && hasV2Balance) {
                baseTokensGeneratedWei = await pyroWethProxy.calculateRedeemedWeth(inputValToUse).call({ account: activeAccountAddress })
            } else {
                const pyroToken = hasV2Balance ? await API.getPyroTokenV2(viewModel.inputAddress) : await API.getPyroTokenV3(viewModel.inputAddress)
                const redeemRate = BigInt(await pyroToken.redeemRate().call({ from: activeAccountAddress }))
                baseTokensGeneratedWei = (inputValToUse * redeemRate * BigInt(98)) / (ONE * BigInt(100))
            }
            outputEstimate = parseFloat(API.fromWei(baseTokensGeneratedWei.toString()))
        }
        var updateOutputTextAction: actions = {
            type: 'UPDATE_OUTPUT_TEXT',
            payload: {
                outputText: formatSignificantDecimalPlaces(outputEstimate, 18)
            }
        }
        dispatch(updateOutputTextAction)
    }

    const calculateInputFromOutput = async () => {
        const outputValToUse = BigInt(API.toWei(viewModel.outputText))
        let inputEstimate, redeemRate
        if (isMinting()) {
            let baseTokensRequired
            const pyroToken = await API.getPyroTokenV3(viewModel.outputAddress)
            redeemRate = BigInt(await pyroToken.redeemRate().call({ from: activeAccountAddress }))
            baseTokensRequired = (outputValToUse * redeemRate) / ONE
            inputEstimate = parseFloat(API.fromWei(baseTokensRequired.toString()))
        } else {

            let pyroTokensRequired
            const pyroToken = await (hasV2Balance ? API.getPyroTokenV2(viewModel.inputAddress) : API.getPyroTokenV3(viewModel.inputAddress))
            const redeemRate = BigInt(await pyroToken.redeemRate().call({ from: activeAccountAddress }))
            pyroTokensRequired = (outputValToUse * bigFactor * ONE * BigInt(98)) / (redeemRate * BigInt(100))

            inputEstimate = parseFloat(API.fromWei(pyroTokensRequired.toString())) / Factor
        }
        dispatch({
            type: 'UPDATE_OUTPUT_TEXT',
            payload: {
                outputText: viewModel.independentField.newValue
            }

        })

        var updateOutputTextAction: actions = {
            type: 'UPDATE_INPUT_TEXT',
            payload: {
                inputText: formatSignificantDecimalPlaces(inputEstimate, 18)
            },
            debug: {
                final: false
            }
        }

        dispatch(updateOutputTextAction)

    }

    const independentFieldCallback = useCallback(async () => {

        try {
            if (viewModel.independentFieldState === "updating dependent field") {
                if (viewModel.independentField.target === 'FROM') { //changes in input textbox affect output textbox
                    await calculateOutputFromInput()
                } else {
                    await calculateInputFromOutput()
                }
                dispatch({
                    type: 'UPDATE_INDEPENDENT_FIELD_STATE',
                    payload: {
                        fieldState: 'validating swap'
                    }
                })
            }
        } catch (e) {
            console.log('calculation error: ' + e)
            dispatch({
                type: 'UPDATE_SWAP_STATE',
                payload: {
                    newState: SwapState.IMPOSSIBLE
                }
            })
            dispatch({
                type: 'UPDATE_INDEPENDENT_FIELD_STATE',
                payload: {
                    fieldState: 'dormant'
                }
            })
        }
    }, [viewModel.independentFieldState, /*viewModel.independentField.target, viewModel.independentField.newValue*/])

    useEffect(() => {
        independentFieldCallback()
    }, [viewModel.independentFieldState])

    const setImpliedExchangeRateString = () => {
        let pyroName, baseName, e, connectorPhrase
        let parsedInput = parseFloat(viewModel.inputText)
        let parsedOutput = parseFloat(viewModel.outputText)
        if (isNaN(parsedInput) || isNaN(parsedOutput)) {

            dispatch({
                type: 'SET_IMPLIED_EXCHANGE_RATE',
                payload: {
                    impliedExchangeRate: ''
                }
            })
            return
        }
        if (isMinting()) {
            pyroName = activeRow.PV3.name
            baseName = activeRow.base.name

            if (viewModel.independentField.target === 'FROM') {
                e = parsedOutput / parsedInput
                connectorPhrase = 'can mint'
                dispatch({
                    type: 'SET_IMPLIED_EXCHANGE_RATE',
                    payload: {
                        impliedExchangeRate: `1 ${baseName} ${connectorPhrase} ${formatSignificantDecimalPlaces(e, 5)} ${pyroName}`
                    }
                })
            }
            else {
                e = parsedInput / parsedOutput
                connectorPhrase = 'requires'
                dispatch({
                    type: 'SET_IMPLIED_EXCHANGE_RATE',
                    payload: {
                        impliedExchangeRate: `1 ${pyroName} ${connectorPhrase} ${formatSignificantDecimalPlaces(e, 5)} ${baseName}`

                    }
                })
            }
        }
        else {
            pyroName = (hasV2Balance ? activeRow.PV2 : activeRow.PV3).name
            baseName = activeRow.base.name

            let leftToken = pyroName
            let rightToken = baseName
            if (viewModel.independentField.target === 'FROM') {
                e = parsedOutput / parsedInput
                connectorPhrase = 'can redeem'
            }
            else {
                e = parsedInput / parsedOutput
                leftToken = baseName
                rightToken = pyroName
                connectorPhrase = 'can be redeemed from'


            }

            dispatch({
                type: 'SET_IMPLIED_EXCHANGE_RATE',
                payload: {
                    impliedExchangeRate: `1 ${leftToken} ${connectorPhrase} ${formatSignificantDecimalPlaces(e, 5)} ${rightToken}`
                }
            })
        }

    }

    const swapValidationCallback = useCallback(() => {
        if (viewModel.independentFieldState === "validating swap") {
            try {
                if (!inputEnabled && viewModel.swapState === SwapState.POSSIBLE) {

                    dispatch({
                        type: 'UPDATE_SWAP_STATE',
                        payload: {
                            newState:
                                SwapState.DISABLED
                        }
                    })

                } else {
                    //check pyrotokens balances
                    const balanceOfInput = parseFloat(API.fromWei(
                        isMinting()
                            ?
                            activeRow.base.balance
                            :
                            (hasV2Balance ? activeRow.PV2.balance :
                                activeRow.PV3.balance)
                    ))

                    dispatch({
                        type: 'UPDATE_SWAP_STATE',
                        payload: {
                            newState: balanceOfInput >= parseFloat(viewModel.inputText)
                                ? SwapState.POSSIBLE
                                : SwapState.DISABLED
                        }
                    })
                }
                setImpliedExchangeRateString()
            } catch (e) {
                dispatch({
                    type: 'UPDATE_SWAP_STATE',
                    payload: {
                        newState: SwapState.IMPOSSIBLE
                    }
                })
                console.warn('validation failed ' + e)
            } finally {
                dispatch({
                    type: 'UPDATE_INDEPENDENT_FIELD_STATE',
                    payload: {
                        fieldState: 'dormant'
                    }
                })
            }
        }
    }, [viewModel.independentFieldState, inputEnabled, viewModel.swapState, activeRow, viewModel.inputAddress, viewModel.inputText])

    useEffect(() => {
        swapValidationCallback()
    }, [viewModel.independentFieldState, inputEnabled, viewModel.swapState, activeRow, viewModel.inputAddress, viewModel.inputText])

    // useEffect(() => {
    //     dispatch({
    //         type: 'UPDATE_INDEPENDENT_FIELD_STATE',
    //         payload: {
    //             fieldState: 'validating swap' as FieldState
    //         }
    //     })
    // }, [inputEnabled])

    const [fromBalance, setFromBalance] = useState<string>('0')
    const [toBalance, setToBalance] = useState<string>('0')

    useEffect(() => {
        const newFromBalance = viewModel.minting ? activeRow.base.balance : (hasV2Balance ? activeRow.PV2.balance : activeRow.PV3.balance)
        const newToBalance = viewModel.minting ? activeRow.PV3.balance : activeRow.base.balance
        setFromBalance(newFromBalance)
        setToBalance(newToBalance)
    }, [rows, activeRow, viewModel.minting])

    const swapAction = async () => {
        if (viewModel.swapState === SwapState.POSSIBLE && inputEnabled) {
            dispatch({
                type: 'SET_SWAP_CLICKED',
                payload: {
                    swapClicked: true
                }
            })
            return;
        } else if (!inputEnabled) {
            const addressToUse = isOutputEth ? pyroWethProxy.address : (isMinting() ? viewModel.outputAddress : viewModel.inputAddress)
            await API.enableToken(
                viewModel.inputAddress,
                activeAccountAddress || "",
                addressToUse, (err, hash: string) => {
                    if (hash) {
                        let t: PendingTX = {
                            hash,
                            type: TXType.approval,
                            token1: viewModel.inputAddress,
                            token2: viewModel.outputAddress,
                        }
                        txQueuePush(t)
                        notify(hash, NotificationType.pending)
                    } else {
                        notify(hash, NotificationType.rejected)
                    }
                })
        }
    }
    const greySwap = inputEnabled && (viewModel.swapState === SwapState.DISABLED || viewModel.swapState === SwapState.IMPOSSIBLE) || swapping
    const setNewMenuAddressFactory = (input: boolean) => (address: string) => {
        dispatch({
            type: 'UPDATE_INDEPENDENT_FIELD',
            payload: {
                target: 'FROM',
                newValue: ''
            }
        })
        dispatch({
            type: 'UPDATE_INDEPENDENT_FIELD',
            payload: {
                target: 'TO',
                newValue: ''
            }
        })

        let inputAddress = address
        let outputAddress = address
        let row = activeRow
        if (input) {
            if (isMinting()) {
                row = rows.filter(r => r.base.address == inputAddress)[0]
                outputAddress = row.PV3.address
            } else {
                row = rows.filter(r => BigInt(r.PV2.balance) > 0 ? r.PV2.address == inputAddress : r.PV3.address == inputAddress)[0]
                outputAddress = row.base.address
            }
        } else {
            if (isMinting()) {
                row = rows.filter(r => r.PV3.address == outputAddress)[0]
                inputAddress = row.base.address
            } else {
                row = rows.filter(r => r.base.address == outputAddress)[0]
                inputAddress = BigInt(row.PV2.balance) > 0 ? row.PV2.address : row.PV3.address
            }
        }
        dispatch({
            type: 'UPDATE_ADDRESS_PAIR',
            payload: {
                input: inputAddress,
                output: outputAddress
            }
        })
        setActiveRow(row)
    }

    useEffect(() => {
        const currentActiveRow = rows.filter(r => r.base.address == activeRow.base.address)[0]
        if (!_.isEqual(currentActiveRow, activeRow))
            setActiveRow(currentActiveRow)
    }, [rows])
    const setNewMenuInputAddress = setNewMenuAddressFactory(true)
    const setNewMenuOutputAddress = setNewMenuAddressFactory(false)

    useEffect(() => {

    }, [viewModel])
    const staticLogo = Logos.filter(l => l.name === 'Pyrotoken')[0]
    const animatedLogo = Logos.filter(l => l.name === 'PyroAnimated')[0]

    if (!(initialized && active && chainId)) {
        return (
            <Box justifyContent="center" alignItems="center" display="flex" height="100%" color="#ddd">
                Please connect your wallet to use the app
            </Box>
        );
    }

    const inputTokenInfo = isMinting() ? activeRow.base : (hasV2Balance ? activeRow.PV2 : activeRow.PV3)
    const outputTokenInfo = isMinting() ? (activeRow.PV3) : activeRow.base

    return (
        <Box className={classes.root}>

            <MigrateToPyroV3
                isMigrationModalOpen={isPyroV3MigrationModalOpen}
                openMigrationModal={() => setIsPyroV3MigrationModalOpen(true)}
                closeMigrationModal={() => setIsPyroV3MigrationModalOpen(false)}
                rows={rows}
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
                                    <TokenSelector input={true} minting={isMinting()} network={networkName} setAddress={setNewMenuInputAddress}
                                        tokenImage={inputTokenInfo.image}
                                        scale={0.65} mobile />
                                </Grid>
                                <Grid item onClick={() => dispatch({
                                    type: 'SET_FLIP_CLICKED', payload: {
                                        flipClicked: true
                                    }
                                })} >
                                    <img width={100} src={swapping ? animatedLogo.image : staticLogo.image} className={classes.pyroShieldMobileAnimated} />
                                </Grid>
                                <Grid item>
                                    <TokenSelector input={false} minting={isMinting()}
                                        network={networkName}
                                        setAddress={setNewMenuOutputAddress}
                                        tokenImage={outputTokenInfo.image}
                                        scale={0.65} mobile />
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
                                                    id={viewModel.inputAddress}
                                                    debounceTimeout={300}
                                                    placeholder={nameOfSelectedInput}
                                                    value={viewModel.inputText}
                                                    onChange={(event) => { setFormattingFrom(event.target.value) }}
                                                    className={inputClasses.inputNarrow} />
                                            </div>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid item>
                                    <BalanceContainer setValue={setFormattingFrom} balance={formatSignificantDecimalPlaces(fromBalance.length > 0 ? API.fromWei(fromBalance) : '0', 4)} token={viewModel.inputAddress} estimate={viewModel.inputSpotDaiPriceView} />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item>
                            <div
                                className={`${classes.flippySwitch} mobile-flippy-switch`}
                                onClick={() => dispatch({
                                    type: 'SET_FLIP_CLICKED', payload: {
                                        flipClicked: true
                                    }
                                })}
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
                                                    id={viewModel.outputAddress}
                                                    placeholder={nameOfSelectedOutput}
                                                    value={viewModel.outputText}
                                                    onChange={(event) => { setFormattingTo(event.target.value) }}
                                                    className={inputClasses.inputNarrow} />
                                            </div>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid item>
                                    <BalanceContainer
                                        setValue={setFormattingTo}
                                        balance={formatSignificantDecimalPlaces(toBalance.length > 0 ? API.fromWei(toBalance) : '0', 4)}
                                        token={viewModel.outputAddress}
                                        estimate={viewModel.outputSpotDaiPriceView} />
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
                                    disabled={viewModel.swapState === SwapState.IMPOSSIBLE || swapping}
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
                                    {viewModel.impliedExchangeRate}
                                </Grid>
                            </Grid>
                        </Grid>

                    </Grid>
                </div>
            </Hidden>
            <Notification />
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
                                                id={viewModel.inputAddress}
                                                key={"desktopInputInput"}
                                                placeholder={nameOfSelectedInput}
                                                value={viewModel.inputText}
                                                onChange={(event) => { setFormattingFrom(event.target.value) }}
                                                className={inputClasses.inputWide} />
                                        </div>
                                    </Grid>
                                    <Grid item>
                                        <BalanceContainer setValue={setFormattingFrom} balance={formatSignificantDecimalPlaces(fromBalance.length > 0 ? API.fromWei(fromBalance) : '0', 4)} token={viewModel.inputAddress} estimate={viewModel.inputSpotDaiPriceView} />
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
                                        <TokenSelector minting={isMinting()}
                                            network={networkName}
                                            setAddress={setNewMenuInputAddress}
                                            tokenImage={inputTokenInfo.image}
                                            scale={0.8}
                                            input={true} />
                                    </Grid>
                                    <Grid item>
                                        <div className={classes.pyroShieldContainer} >
                                            <Tooltip title={swapping ? "" : "FLIP TOKEN ORDER"} arrow>
                                                <img width={160} src={swapping ? animatedLogo.image : staticLogo.image} className={classes.pyroShield} onClick={() => dispatch({
                                                    type: 'SET_FLIP_CLICKED', payload: {
                                                        flipClicked: true
                                                    }
                                                })} />

                                            </Tooltip>
                                        </div>
                                    </Grid>
                                    <Grid item>
                                        <TokenSelector minting={isMinting()}
                                            network={networkName}
                                            setAddress={setNewMenuOutputAddress}
                                            tokenImage={outputTokenInfo.image}
                                            scale={0.8}
                                            input={false}
                                        />
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
                                                id={viewModel.outputAddress}
                                                debounceTimeout={300}
                                                key={"desktopInputOutput"}
                                                placeholder={nameOfSelectedOutput}
                                                value={viewModel.outputText}
                                                onChange={(event) => { setFormattingTo(event.target.value) }}
                                                className={inputClasses.inputWide} />
                                        </div>
                                    </Grid>
                                    <Grid item>
                                        <BalanceContainer
                                            setValue={setFormattingTo}
                                            balance={formatSignificantDecimalPlaces(toBalance.length > 0 ? API.fromWei(toBalance) : '0', 4)}
                                            token={viewModel.outputAddress}
                                            estimate={viewModel.outputSpotDaiPriceView} />
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
                                disabled={viewModel.swapState === SwapState.IMPOSSIBLE || swapping}
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
                                {viewModel.swapState !== SwapState.IMPOSSIBLE ? viewModel.impliedExchangeRate : ""}
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Hidden>

            <MigrateToPyroV3Link
                openMigrationModal={() => setIsPyroV3MigrationModalOpen(true)}
                rows={rows}
            />
        </Box >
    )
}
