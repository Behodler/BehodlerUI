import React, { useEffect, useCallback, useState } from 'react'
import { Button, Box, Grid, Hidden, Tooltip } from '@material-ui/core'
import BigNumber from 'bignumber.js'
import { DebounceInput } from 'react-debounce-input';
import { useDebounce } from '@react-hook/debounce'

import API from '../../../../blockchain/ethereumAPI'
import { useActiveWeb3React } from '../hooks/useActiveWeb3React'
import { MigrateToPyroV3 } from '../PyroV3Migration/MigrateToPyroV3'
import { MigrateToPyroV3Link } from '../PyroV3Migration/MigrateToPyroV3Link';
import { useTradeableTokensList } from "../hooks/useTradeableTokensList";
import { useLoggedState } from "../hooks/useLoggedState";
import { useCurrentBlock } from "../hooks/useCurrentBlock";
import { useTXQueue } from "../hooks/useTXQueue";
import { useWalletContext } from "../hooks/useWalletContext";
import { useBehodlerContract, usePyroWeth10ProxyContract, useWeth10Contract } from "../hooks/useContracts";
import { useWatchTokenBalancesEffect, useBaseTokenBalances, usePyroV2TokenBalances, usePyroV3TokenBalances } from "../hooks/useTokenBalances";
import { useActiveAccountAddress } from "../hooks/useAccount";
import { useTokenConfigs } from "../hooks/useTokenConfigs";

import { Notification, NotificationType, useShowNotification } from './components/Notification'
import { PyroTokensInfo } from './components/PyroTokensInfo';
import { BalanceContainer } from './components/BalanceContainer';
import { DirectionLabel } from './components/DirectionLabel';
import { useStyles, inputStyles } from './styles';
import { SwapState, TXType, PendingTX, FieldState, IndependentField } from './types';
import TokenSelector from './TokenSelector'
import { formatSignificantDecimalPlaces } from './jsHelpers'
import { Logos } from './ImageLoader'

BigNumber.config({ EXPONENTIAL_AT: 50, DECIMAL_PLACES: 18 });

const Factor = 1000000
const bigFactor = BigInt(Factor)
const ONE = BigInt(1000000000000000000)

//using undefined coupled with boolean can lead to false negatives
enum V2BalanceState {
    unset,
    has,
    hasNot
}
class IOset {
    input: string
    output: string
    private _minting: boolean
    private account: string
    private v2BalanceState: V2BalanceState = V2BalanceState.unset
    private _hasV2Balance: boolean = false

    hasV2BalanceStale(): boolean {
        return this.v2BalanceState == V2BalanceState.unset
    }

    hasV2Balance(): boolean {
        return this._hasV2Balance
    }

    async updateV2Balance(): Promise<void> {
        const baseTokenAddress = this._minting ? this.input : this.output
        const pyroV2 = await API.getPyroTokenV2(baseTokenAddress, true)
        const balance = BigInt(await pyroV2.balanceOf(this.account).call())
        console.log('balance ' + balance)
        this._hasV2Balance = balance > (1000000n)
        this.v2BalanceState = this._hasV2Balance ? V2BalanceState.has : V2BalanceState.hasNot
    }

    //function for comparing equality of IOsets
    equals(other: IOset): boolean {
        return this.input === other.input && this.output === other.output && this._minting === other._minting && other.hasV2Balance == this.hasV2Balance
    }

    minting(): boolean {
        return this._minting
    }

    //ensure a valid IOset is instantiated.
    static async spawn(input: string, output: string, minting: boolean, account: string): Promise<IOset> {
        const set: IOset = new IOset(input, output, minting, account)
        await set.updateV2Balance()
        return set;
    }

    constructor(input: string, output: string, minting: boolean, account: string) {
        this.input = input
        this.output = output
        this._minting = minting
        this.account = account
        this.v2BalanceState = V2BalanceState.unset
    }

    async flip(): Promise<IOset> {
        return await IOset.spawn(this.output, this.input, !this._minting, this.account)
    }
}

export default function () {
    const classes = useStyles();
    const inputClasses = inputStyles();

    const { networkName, initialized, contracts } = useWalletContext();
    const { chainId, active } = useActiveWeb3React()
    const groups = useTradeableTokensList()
    const activeAccountAddress = useActiveAccountAddress()
    const { addressToPyroTokenV2, addressToPyroTokenV3, addressToBaseToken } = useTokenConfigs()

    const pyroWethProxy = usePyroWeth10ProxyContract()
    const behodler = useBehodlerContract()
    const weth10 = useWeth10Contract()

    const block = useCurrentBlock()
    const showNotification = useShowNotification()

    const pyroV2TokenBalances = usePyroV2TokenBalances()
    const pyroV3TokenBalances = usePyroV3TokenBalances()
    const baseTokenBalances = useBaseTokenBalances()

    const [swapping, setSwapping] = useLoggedState<boolean>(false)
    const [isPyroV3MigrationModalOpen, setIsPyroV3MigrationModalOpen] = useState(false);

    const notify = (hash: string, type: NotificationType) => {
        showNotification(type, hash, () => {
            setSwapping(type === NotificationType.pending)
        })
    }

    const { queueUpdateCallback, txQueuePush } = useTXQueue(notify)

    useWatchTokenBalancesEffect()

    useEffect(() => {
        queueUpdateCallback()
    }, [block])

    const [inputValue, setInputValue] = useLoggedState<string>('')

    const [outputValue, setOutputValue] = useLoggedState<string>('')
    const [swapState, setSwapState] = useLoggedState<SwapState>(SwapState.IMPOSSIBLE, "swap state")
    const [independentField, setIndependentField] = useDebounce<IndependentField>({
        target: 'FROM',
        newValue: ''
    }, 600)
    const [flipClicked, setFlipClicked] = useLoggedState<boolean>(false)
    const [independentFieldState, setIndependentFieldState] = useLoggedState<FieldState>('dormant')
    const [inputEnabled, setInputEnabled] = useLoggedState<boolean>(false, 'inputEnabled')

    const [addresses, setAddresses] = useState<IOset>(new IOset(groups.baseTokens[0].address, groups.pyroTokensV3[0].address, true, activeAccountAddress))

    const v2BalanceCallBack = useCallback(async () => {
        if (addresses.hasV2BalanceStale()) {
            await addresses.updateV2Balance()
            setAddresses(addresses)
        }
    }, [addresses.hasV2BalanceStale()])

    useEffect(() => {
        v2BalanceCallBack()
    }, [addresses.hasV2BalanceStale()])

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
            const independentFieldNumericValue = parseFloat(independentField.newValue);
            const independentFieldContainsOnlyDigitsAndDot = /^[\d\.]+$/g.test(independentField.newValue);
            const isEmptyIndependentFieldInput = independentField.newValue === ''
            const isValidIndependentFieldInput = isEmptyIndependentFieldInput || (
                !Number.isNaN(independentFieldNumericValue)
                && independentFieldNumericValue > 0
                && independentFieldContainsOnlyDigitsAndDot
            )
            const independentFieldTargetIsFrom = independentField.target === 'FROM'

            const updating = independentFieldTargetIsFrom
                ? isValidIndependentFieldInput && independentField.newValue !== inputValue
                : isValidIndependentFieldInput && independentField.newValue !== outputValue

            const outputMessage = (!isEmptyIndependentFieldInput && updating && 'calculating...')
                || (!isValidIndependentFieldInput && 'invalid input')
                || ''

            setInputValue(independentFieldTargetIsFrom ? independentField.newValue : outputMessage)
            setOutputValue(independentFieldTargetIsFrom ? outputMessage : independentField.newValue)

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
        if (!groups.daiAddress || groups.daiAddress.length < 3 || addresses.hasV2BalanceStale())
            return
        setSwapState(SwapState.IMPOSSIBLE)

        try {
            const DAI = await API.getToken(groups.daiAddress, networkName)
            const daiBalanceOnBehodler = new BigNumber(await DAI.balanceOf(behodler.address).call({ from: activeAccountAddress }))
            const inputToUse = isInputEth ? weth10.address : addresses.input
            const outputToUse = isOutputEth ? weth10.address : addresses.output
            if (addresses.minting()) {
                const inputToken = await API.getToken(inputToUse, networkName)
                const inputBalanceOnBehodler = await inputToken.balanceOf(behodler.address).call({ from: activeAccountAddress })
                const inputSpot = daiBalanceOnBehodler.div(inputBalanceOnBehodler).toString()
                setinputSpotDaiPriceView(formatSignificantDecimalPlaces(inputSpot.toString(), 2))

                const intSpot = Math.floor(parseFloat(inputSpot) * Factor)
                //Don't allow minting of V2
                const pyroToken = await API.getPyroTokenV3(addresses.output)
                const redeemRate = BigInt((await pyroToken.redeemRate().call({ from: activeAccountAddress })).toString())
                const bigSpot = BigInt(!Number.isNaN(intSpot) ? intSpot : 0)
                const spotForPyro = (redeemRate * bigSpot) / (ONE)
                const outputSpot = parseFloat(spotForPyro.toString()) / Factor
                setoutputSpotDaiPriceView(formatSignificantDecimalPlaces(outputSpot.toString(), 2))
            } else {
                const outputToken = await API.getToken(outputToUse, networkName)
                const outputBalanceOnBehodler = await outputToken.balanceOf(behodler.address).call({ from: activeAccountAddress })
                const outputSpot = daiBalanceOnBehodler.div(outputBalanceOnBehodler).toString()
                setoutputSpotDaiPriceView(formatSignificantDecimalPlaces(outputSpot, 2))

                const intSpot = Math.floor(parseFloat(outputSpot) * Factor)

                //Don't allow redeeming of V3 until all V2 is redeemed for a given token. 
                //We're nudging everyone off the V2 cliff into the ocean of V3 via UX 
                //like one of those annoying facebook feature updates you didn't ask for.
                const pyroTokenV2 = await API.getPyroTokenV2(addresses.input, addresses.minting())
                const pyroTokenV3 = await API.getPyroTokenV3(addresses.input, addresses.minting())

                const redeemRateFunction = (await addresses.hasV2Balance()) ? pyroTokenV2.redeemRate : pyroTokenV3.redeemRate
                const redeemString = (await redeemRateFunction().call({ from: activeAccountAddress })).toString()
                const redeemRate = BigInt(redeemString)
                const bigSpot = BigInt(!Number.isNaN(intSpot) ? intSpot : 0)
                // const bigSpot = BigInt(intSpot)
                const spotForPyro = (redeemRate * bigSpot) / ONE
                const inputSpot = parseFloat(spotForPyro.toString()) / Factor
                setinputSpotDaiPriceView(formatSignificantDecimalPlaces(inputSpot.toString(), 2))
            }
        } catch (e) {
            console.error(e)
            return
        }
    }, [addresses, groups.daiAddress])

    useEffect(() => {
        if (initialized) {
            spotPriceCallback()
        }
    }, [addresses, addresses, groups.daiAddress, initialized])


    const [swapClicked, setSwapClicked] = useLoggedState<boolean>(false)
    const nameOfSelectedAddress = (input: boolean, minting: boolean, hasV2Balance: boolean) => (address: string) => {
        const useBase = input && minting || !input && !minting
        address = address.toLowerCase()
        let value: string | undefined = ''
        if (useBase)
            value = groups.baseTokens.find(i => i.address.toLowerCase() === address)?.name

        else if (hasV2Balance && !minting)
            value = groups.pyroTokensV2.find(i => i.address.toLowerCase() === address)?.name

        else value = groups.pyroTokensV3.find(i => i.address.toLowerCase() === address)?.name
        return value || ''
    }
    const nameOfSelectedInput = nameOfSelectedAddress(true, addresses.minting(), addresses.hasV2Balance())
    const nameOfSelectedOutput = nameOfSelectedAddress(false, addresses.minting(), addresses.hasV2Balance())


    const isTokenPredicateFactory = (tokenName: string) => (address: string) => {
        return (input: boolean) => {
            const name = input ? nameOfSelectedInput(address) : nameOfSelectedOutput(address)
            return (name.toLowerCase() === tokenName.toLowerCase())
        }
    }

    const isInputEth = isTokenPredicateFactory("Eth")(addresses.input)(true)
    const isOutputEth = isTokenPredicateFactory("Eth")(addresses.output)(false)

    useEffect(() => {
        if (!inputEnabled) {
            setSwapText('APPROVE ' + nameOfSelectedInput(addresses.input))
        }
        else if (addresses.minting()) {
            setSwapText('MINT')
        } else {
            setSwapText('REDEEM')
        }
    }, [inputEnabled, addresses.input, addresses.output])

    const currentTokenEffects = initialized
        ? API.generateNewEffects(addresses.input, activeAccountAddress, isInputEth)
        : null

    useEffect(() => {
        if (!currentTokenEffects) {
            return;
        }

        const balance = formatSignificantDecimalPlaces(fromBalance.length > 0 ? API.fromWei(fromBalance[0].balance) : '0', 4)
        if (swapState === SwapState.IMPOSSIBLE)
            setImpliedExchangeRate("")

        let addressToCheck = addresses.minting() ? addresses.output : addresses.input
        if (isOutputEth)
            addressToCheck = pyroWethProxy.address
        if (isInputEth) {
            setInputEnabled(true)
            return
        }

        const effect = currentTokenEffects.allowance(activeAccountAddress, addressToCheck)
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

    }, [addresses.input, addresses.output, swapState, independentFieldState, currentTokenEffects])

    const hashBack = (type: TXType) => (err, hash: string) => {
        if (hash) {
            let t: PendingTX = {
                hash,
                type,
                token1: addresses.input,
                token2: addresses.output,
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
        const inputValWei = API.toWei(inputValue)
        const primaryOptions = { from: activeAccountAddress, gas: undefined };
        const ethOptions = { from: activeAccountAddress, value: inputValWei, gas: undefined };

        if (swapClicked) {
            const pyroTokenAddress = addresses.minting() ? addresses.output : addresses.input
            const pyroToken = addresses.minting() ? await API.getPyroTokenV3(pyroTokenAddress)
                : (addresses.hasV2Balance() ? await API.getPyroTokenV2(pyroTokenAddress) : await API.getPyroTokenV3(pyroTokenAddress))
            const mintContract = isInputEth ? pyroWethProxy : pyroToken
            const redeemContract = isOutputEth ? pyroWethProxy : pyroToken
            const options = addresses.minting() && isInputEth ? ethOptions : primaryOptions

            try {
                if (addresses.minting()) {

                    await broadCast(mintContract, 'mint', options, mintHashBack, activeAccountAddress, inputValWei)
                } else {
                    if (addresses.hasV2Balance())
                        await broadCast(redeemContract, 'redeem', options, redeemHashBack, inputValWei)
                    else
                        await broadCast(redeemContract, 'redeem', options, redeemHashBack, activeAccountAddress, inputValWei)

                }

                setSwapState(SwapState.IMPOSSIBLE)
                updateIndependentFromField('')
                updateIndependentToField('')
            } catch (e) {
                console.error(e);
            }
        }
        setSwapClicked(false)
    }, [swapClicked])

    useEffect(() => {
        if (swapClicked) {
            swap2Callback()
        }
    }, [swapClicked])

    useEffect(() => {
        const flipClickedCallback = async () => {
            let newaddresses = addresses

            if (flipClicked) {
                setFlipClicked(false)
    
                if (addresses.minting()) {
                    if (addresses.hasV2Balance()) {
                        const pyroTokenV2Address = await contracts.behodler.Behodler2.LiquidityReceiverV2.baseTokenMapping(addresses.input).call()
                        newaddresses = await IOset.spawn(pyroTokenV2Address, addresses.input, false, activeAccountAddress)
                    } else {
                        newaddresses = await addresses.flip()
                    }
                } else {
                    const pyroV3Address = await contracts.behodler.Behodler2.LiquidityReceiverV3.getPyroToken(addresses.output).call();
                    newaddresses = await IOset.spawn(addresses.output, pyroV3Address, true, activeAccountAddress)
                }

                if (swapState !== SwapState.IMPOSSIBLE) {
                    updateIndependentField('FROM')(outputValue)
                } else {
                    setInputValue("")
                    setOutputValue("")
                }
                setAddresses(newaddresses)
            }

        }
        if (flipClicked)
            flipClickedCallback()
        setFlipClicked(false)
    }, [flipClicked])

    const calculateOutputFromInput = async () => {
        const inputValToUse = BigInt(API.toWei(inputValue))
        let outputEstimate, redeemRate

        if (addresses.minting()) {
            let pyrotokensGeneratedWei

            const pyroToken = await API.getPyroTokenV3(addresses.output)
            redeemRate = BigInt(await pyroToken.redeemRate().call({ from: activeAccountAddress }))
            pyrotokensGeneratedWei = (inputValToUse * bigFactor * ONE) / redeemRate

            outputEstimate = parseFloat(API.fromWei(pyrotokensGeneratedWei.toString())) / Factor
        } else {
            let baseTokensGeneratedWei
            if (isOutputEth && addresses.hasV2Balance()) {
                baseTokensGeneratedWei = await pyroWethProxy.calculateRedeemedWeth(inputValToUse).call({ account: activeAccountAddress })
            } else {
                const pyroToken = addresses.hasV2Balance() ? await API.getPyroTokenV2(addresses.input) : await API.getPyroTokenV3(addresses.input)
                const redeemRate = BigInt(await pyroToken.redeemRate().call({ from: activeAccountAddress }))
                baseTokensGeneratedWei = (inputValToUse * redeemRate * BigInt(98)) / (ONE * BigInt(100))
            }
            outputEstimate = parseFloat(API.fromWei(baseTokensGeneratedWei.toString()))
        }
        setOutputValue(formatSignificantDecimalPlaces(outputEstimate, 18))
    }

    const calculateInputFromOutput = async () => {
        const outputValToUse = BigInt(API.toWei(outputValue))
        let inputEstimate, redeemRate
        if (addresses.minting()) {
            let baseTokensRequired
            const pyroToken = await API.getPyroTokenV3(addresses.output)
            redeemRate = BigInt(await pyroToken.redeemRate().call({ from: activeAccountAddress }))
            baseTokensRequired = (outputValToUse * redeemRate) / ONE

            inputEstimate = parseFloat(API.fromWei(baseTokensRequired.toString()))
        } else {
            let pyroTokensRequired
            const pyroToken = await (addresses.hasV2Balance() ? API.getPyroTokenV2(addresses.input) : API.getPyroTokenV3(addresses.input))
            const redeemRate = BigInt(await pyroToken.redeemRate().call({ from: activeAccountAddress }))
            pyroTokensRequired = (outputValToUse * bigFactor * ONE * BigInt(98)) / (redeemRate * BigInt(100))

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
        if (addresses.minting()) {
            pyroName = pyroV3TokenBalances.filter(p => p.address.toLowerCase() === addresses.output.toLowerCase())[0].name
            baseName = baseTokenBalances.filter(p => p.address.toLowerCase() === addresses.input.toLowerCase())[0].name

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
            pyroName = addresses.hasV2Balance() ? pyroV2TokenBalances.filter(p => p.address.toLowerCase() === addresses.input.toLowerCase())[0].name
                : pyroV3TokenBalances.filter(p => p.address.toLowerCase() === addresses.input.toLowerCase())[0].name
            baseName = baseTokenBalances.filter(p => p.address.toLowerCase() === addresses.output.toLowerCase())[0].name

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

    const swapValidationCallback = useCallback(() => {

        if (independentFieldState === "validating swap") {
            try {
                if (!inputEnabled && swapState === SwapState.POSSIBLE) {
                    setSwapState(SwapState.DISABLED)
                } else {
                    //check pyrotokens balances
                    const balanceOfInput = parseFloat(API.fromWei(
                        addresses.minting()
                            ?
                            baseTokenBalances.filter(b => b.address === addresses.input)[0].balance
                            :
                            (addresses.hasV2Balance() ? pyroV2TokenBalances.filter(b => b.address === addresses.input)[0].balance :
                                pyroV3TokenBalances.filter(b => b.address === addresses.input)[0].balance)
                    ))

                    setSwapState((
                        balanceOfInput >= parseFloat(inputValue)
                            ? SwapState.POSSIBLE
                            : SwapState.DISABLED
                    ))
                }
                setImpliedExchangeRateString()
            } catch (e) {
                setSwapState(SwapState.IMPOSSIBLE)
                console.warn('validation failed ' + e)
            }
            setIndependentFieldState("dormant")
        }
    }, [independentFieldState, inputEnabled, swapState, baseTokenBalances?.length, addresses.input, inputValue])

    useEffect(() => {
        swapValidationCallback()
    }, [independentFieldState, inputEnabled, swapState, baseTokenBalances?.length, addresses.input, inputValue])

    useEffect(() => {
        setIndependentFieldState("validating swap")
    }, [inputEnabled])

    const fromBalance = addresses.minting() ? baseTokenBalances.filter(t => t.address.toLowerCase() === addresses.input.toLowerCase()) : (addresses.hasV2Balance() ? pyroV2TokenBalances : pyroV3TokenBalances).filter(t => t.address.toLowerCase() === addresses.input.toLowerCase())
    const toBalance = addresses.minting() ? pyroV3TokenBalances.filter(t => t.address.toLowerCase() === addresses.output.toLowerCase()) : baseTokenBalances.filter(t => t.address.toLowerCase() === addresses.output.toLowerCase())

    const swapAction = async () => {
        if (swapState === SwapState.POSSIBLE && inputEnabled) {
            setSwapClicked(true)
            return;
        } else if (!inputEnabled) {
            const addressToUse = isOutputEth ? pyroWethProxy.address : (addresses.minting() ? addresses.output : addresses.input)
            await API.enableToken(
                addresses.input,
                activeAccountAddress || "",
                addressToUse, (err, hash: string) => {
                    if (hash) {
                        let t: PendingTX = {
                            hash,
                            type: TXType.approval,
                            token1: addresses.input,
                            token2: addresses.output,
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
        updateIndependentFromField('')
        updateIndependentToField('')
        setAddresses(new IOset(address, addresses.output, addresses.minting(), activeAccountAddress))
    }
    const setNewMenuOutputAddress = (address: string) => {
        updateIndependentFromField('')
        updateIndependentToField('')
        setAddresses(new IOset(addresses.input, address, addresses.minting(), activeAccountAddress))

    }
    const staticLogo = Logos.filter(l => l.name === 'Pyrotoken')[0]
    const animatedLogo = Logos.filter(l => l.name === 'PyroAnimated')[0]

    if (!(initialized && active && chainId)) {
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
                pyroTokenV2Balances={pyroV2TokenBalances}
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
                                    <TokenSelector pyro={!addresses.minting()} network={networkName} setAddress={setNewMenuInputAddress}
                                        tokenImage={addresses.minting() ? addressToBaseToken(addresses.input, "mobile input").image : (addresses.hasV2Balance() ?
                                            addressToPyroTokenV2(addresses.input) :
                                            addressToPyroTokenV3(addresses.input)).image}
                                        scale={0.65} mobile balances={addresses.minting() ? baseTokenBalances : pyroV3TokenBalances} />
                                </Grid>
                                <Grid item onClick={() => setFlipClicked(true)} >
                                    <img width={100} src={swapping ? animatedLogo.image : staticLogo.image} className={classes.pyroShieldMobileAnimated} />
                                </Grid>
                                <Grid item>
                                    <TokenSelector pyro={addresses.minting()} network={networkName} balances={addresses.minting() ? pyroV3TokenBalances : baseTokenBalances} setAddress={setNewMenuOutputAddress} tokenImage={addresses.minting() ? addressToPyroTokenV3(addresses.output).image : addressToBaseToken(addresses.output, "mobile output").image} scale={0.65} mobile />
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
                                                    id={addresses.input}
                                                    debounceTimeout={300}
                                                    placeholder={nameOfSelectedInput(addresses.input)}
                                                    value={inputValue}
                                                    onChange={(event) => { setFormattingFrom(event.target.value) }}
                                                    className={inputClasses.inputNarrow} />
                                            </div>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid item>
                                    <BalanceContainer setValue={setFormattingFrom} balance={formatSignificantDecimalPlaces(fromBalance.length > 0 ? API.fromWei(fromBalance[0].balance) : '0', 4)} token={addresses.input} estimate={inputSpotDaiPriceView} />
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
                                                    id={addresses.output}
                                                    placeholder={nameOfSelectedOutput(addresses.output)}
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
                                        token={addresses.output}
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
                                                id={addresses.input}
                                                key={"desktopInputInput"}
                                                placeholder={nameOfSelectedInput(addresses.input)}
                                                value={inputValue}
                                                onChange={(event) => { setFormattingFrom(event.target.value) }}
                                                className={inputClasses.inputWide} />
                                        </div>
                                    </Grid>
                                    <Grid item>
                                        <BalanceContainer setValue={setFormattingFrom} balance={formatSignificantDecimalPlaces(fromBalance.length > 0 ? API.fromWei(fromBalance[0].balance) : '0', 4)} token={addresses.input} estimate={inputSpotDaiPriceView} />
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
                                        <TokenSelector pyro={!addresses.minting()} balances={addresses.minting() ? baseTokenBalances : (addresses.hasV2Balance() ? pyroV2TokenBalances : pyroV3TokenBalances)}
                                            network={networkName}
                                            setAddress={setNewMenuInputAddress}
                                            tokenImage={addresses.minting() ? addressToBaseToken(addresses.input, "desktop input").image : (addresses.hasV2Balance() ? addressToPyroTokenV2(addresses.input) : addressToPyroTokenV3(addresses.input)).image}
                                            scale={0.8} />
                                    </Grid>
                                    <Grid item>
                                        <div className={classes.pyroShieldContainer} >
                                            <Tooltip title={swapping ? "" : "FLIP TOKEN ORDER"} arrow>
                                                <img width={160} src={swapping ? animatedLogo.image : staticLogo.image} className={classes.pyroShield} onClick={() => setFlipClicked(true)} />

                                            </Tooltip>
                                        </div>
                                    </Grid>
                                    <Grid item>
                                        <TokenSelector pyro={addresses.minting()}
                                            balances={addresses.minting() ? pyroV3TokenBalances : baseTokenBalances} network={networkName}
                                            setAddress={setNewMenuOutputAddress}
                                            tokenImage={addresses.minting() ? addressToPyroTokenV3(addresses.output).image : addressToBaseToken(addresses.output, "desktop output").image}
                                            scale={0.8} />
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
                                                id={addresses.output}
                                                debounceTimeout={300}
                                                key={"desktopInputOutput"}
                                                placeholder={nameOfSelectedOutput(addresses.output)}
                                                value={outputValue}
                                                onChange={(event) => { setFormattingTo(event.target.value) }}
                                                className={inputClasses.inputWide} />
                                        </div>
                                    </Grid>
                                    <Grid item>
                                        <BalanceContainer
                                            setValue={setFormattingTo}
                                            balance={formatSignificantDecimalPlaces(toBalance.length > 0 ? API.fromWei(toBalance[0].balance) : '0', 4)}
                                            token={addresses.output}
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
                pyroTokenV2Balances={pyroV2TokenBalances}
            />
        </Box >
    )
}
