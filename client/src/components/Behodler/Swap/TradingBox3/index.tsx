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
import { useBehodlerContract, usePyroWeth10ProxyContract, useWeth10Contract, useContractCall } from "../hooks/useContracts";
import { useWatchTokenBalancesEffect, useBaseTokenBalances, usePyroTokenBalances } from "../hooks/useTokenBalances";
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

export default function () {
    const classes = useStyles();
    const inputClasses = inputStyles();

    const { networkName, initialized } = useWalletContext();
    const { chainId, active } = useActiveWeb3React()
    const { baseTokens, pyroTokens, daiAddress, allTokensConfig } = useTradeableTokensList()
    const activeAccountAddress = useActiveAccountAddress()
    const { addressToPyroToken, addressToBaseToken } = useTokenConfigs()

    const pyroWethProxy = usePyroWeth10ProxyContract()
    const behodler = useBehodlerContract()
    const weth10 = useWeth10Contract()
    const [callPyroWethProxy] = useContractCall(pyroWethProxy)

    const block = useCurrentBlock()
    const showNotification = useShowNotification()

    const pyroTokenBalances = usePyroTokenBalances()
    const baseTokenBalances = useBaseTokenBalances()

    const [swapping, setSwapping] = useLoggedState<boolean>(false)
    const [minting, setMinting] = useLoggedState<boolean>(true)
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
    const [swapState, setSwapState] = useLoggedState<SwapState>(SwapState.IMPOSSIBLE)
    const [independentField, setIndependentField] = useDebounce<IndependentField>({
        target: 'FROM',
        newValue: ''
    }, 600)
    const [independentFieldState, setIndependentFieldState] = useLoggedState<FieldState>('dormant')
    const [inputEnabled, setInputEnabled] = useLoggedState<boolean>(false)
    const [inputAddress, setInputAddress] = useLoggedState<string>(baseTokens[0].address)
    const [outputAddress, setOutputAddress] = useLoggedState<string>(pyroTokens[0].address)
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
        if (!daiAddress || daiAddress.length < 3)
            return
        setSwapState(SwapState.IMPOSSIBLE)

        try {
            const DAI = await API.getToken(daiAddress, networkName)
            const daiBalanceOnBehodler = new BigNumber(await DAI.balanceOf(behodler.address).call({ from: activeAccountAddress }))
            const inputAddressToUse = isInputEth ? weth10.address : inputAddress
            const outputAddressToUse = isOutputEth ? weth10.address : outputAddress
            if (minting) {
                const inputToken = await API.getToken(inputAddressToUse, networkName)
                const inputBalanceOnBehodler = await inputToken.balanceOf(behodler.address).call({ from: activeAccountAddress })
                const inputSpot = daiBalanceOnBehodler.div(inputBalanceOnBehodler).toString()
                setinputSpotDaiPriceView(formatSignificantDecimalPlaces(inputSpot.toString(), 2))

                const intSpot = Math.floor(parseFloat(inputSpot) * Factor)
                const pyroToken = await API.getPyroToken(outputAddress, networkName)
                const redeemRate = BigInt((await pyroToken.redeemRate().call({ from: activeAccountAddress })).toString())
                const bigSpot = BigInt(!Number.isNaN(intSpot) ? intSpot : 0)
                const spotForPyro = (redeemRate * bigSpot) / (ONE)
                const outputSpot = parseFloat(spotForPyro.toString()) / Factor
                setoutputSpotDaiPriceView(formatSignificantDecimalPlaces(outputSpot.toString(), 2))
            } else {
                const outputToken = await API.getToken(outputAddressToUse, networkName)
                const outputBalanceOnBehodler = await outputToken.balanceOf(behodler.address).call({ from: activeAccountAddress })
                const outputSpot = daiBalanceOnBehodler.div(outputBalanceOnBehodler).toString()
                setoutputSpotDaiPriceView(formatSignificantDecimalPlaces(outputSpot, 2))

                const intSpot = Math.floor(parseFloat(outputSpot) * Factor)
                const pyroToken = await API.getPyroToken(inputAddress, networkName)
                const redeemRate = BigInt((await pyroToken.redeemRate().call({ from: activeAccountAddress })).toString())
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
    }, [inputAddress, outputAddress, daiAddress])

    useEffect(() => {
        if (initialized) {
            spotPriceCallback()
        }
    }, [inputAddress, outputAddress, daiAddress, initialized])


    const [swapClicked, setSwapClicked] = useLoggedState<boolean>(false)
    const nameOfSelectedAddress = (input: boolean, minting: boolean) => (address: string) => {
        const useBase = input && minting || !input && !minting
        address = address.toLowerCase()
        return (useBase ? baseTokens.find(i => i.address.toLowerCase() === address)?.name : pyroTokens.find(i => i.address.toLowerCase() === address)?.name) || ''
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
                const tokenPair = allTokensConfig.filter(t => t.address === inputAddress)[0]
                setOutputAddress(tokenPair.pyroAddress)
            } else {
                const tokenPair = allTokensConfig.filter(t => t.pyroAddress === inputAddress)[0]
                setOutputAddress(tokenPair.address)
            }
        } else {
            if (minting) {
                const tokenPair = allTokensConfig.filter(t => t.pyroAddress === outputAddress)[0]
                setInputAddress(tokenPair.address)
            } else {
                const tokenPair = allTokensConfig.filter(t => t.address === outputAddress)[0]
                setInputAddress(tokenPair.pyroAddress)
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

    const currentTokenEffects = initialized
        ? API.generateNewEffects(inputAddress, activeAccountAddress, isInputEth)
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
                        .catch(reject)
                    resolve(txResult)
                })
        })

    }, [])

    const swap2Callback = useCallback(async () => {
        const inputValWei = API.toWei(inputValue)
        const primaryOptions = { from: activeAccountAddress, gas: undefined };
        const ethOptions = { from: activeAccountAddress, value: inputValWei, gas: undefined };

        console.info("tx invocation initiated.")
        if (swapClicked) {
            const pyroTokenAddress = minting ? outputAddress : inputAddress
            const pyroToken = await API.getPyroToken(pyroTokenAddress, networkName)
            const mintContract = isInputEth ? pyroWethProxy : pyroToken
            const redeemContract = isOutputEth ? pyroWethProxy : pyroToken
            const options = minting && isInputEth ? ethOptions : primaryOptions

            try {
                if (minting) {
                    await mintOrRedeem(mintContract, 'mint', options, inputValWei, mintHashBack)
                } else {
                    await mintOrRedeem(redeemContract, 'redeem', options, inputValWei, redeemHashBack)
                }

                setSwapState(SwapState.IMPOSSIBLE)
                updateIndependentFromField('')
                updateIndependentToField('')
            } catch (e) {
                console.error('swap error: ', e, {
                    minting,
                    pyroToken,
                })
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
        const inputIsBase = allTokensConfig.filter(t => t.address.toLowerCase() === newInputAddress.toLowerCase()).length > 0
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
                const mintedPyroWeth = await callPyroWethProxy({
                    method: 'calculateMintedPyroWeth',
                    args: [inputValToUse],
                    overrides: { from: activeAccountAddress },
                })
                pyrotokensGeneratedWei = bigFactor * BigInt(mintedPyroWeth)
            } else {
                const pyroToken = await API.getPyroToken(outputAddress, networkName)
                redeemRate = BigInt(await pyroToken.redeemRate().call({ from: activeAccountAddress }))
                pyrotokensGeneratedWei = (inputValToUse * bigFactor * ONE) / redeemRate
            }
            outputEstimate = parseFloat(API.fromWei(pyrotokensGeneratedWei.toString())) / Factor
        } else {
            let baseTokensGeneratedWei
            if (isOutputEth) {
                baseTokensGeneratedWei = await callPyroWethProxy({
                    method: 'calculateRedeemedWeth',
                    args: [inputValToUse],
                    overrides: { from: activeAccountAddress },
                })
            } else {
                const pyroToken = await API.getPyroToken(inputAddress, networkName)
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
        if (minting) {
            let baseTokensRequired
            if (isInputEth) {
                baseTokensRequired = await callPyroWethProxy({
                    method: 'calculateRedeemedWeth',
                    args: [outputValToUse],
                    overrides: { from: activeAccountAddress },
                })
            } else {
                const pyroToken = await API.getPyroToken(outputAddress, networkName)
                redeemRate = BigInt(await pyroToken.redeemRate().call({ from: activeAccountAddress }))
                baseTokensRequired = (outputValToUse * redeemRate) / ONE
            }
            inputEstimate = parseFloat(API.fromWei(baseTokensRequired.toString()))
        } else {
            let pyroTokensRequired
            if (isInputEth) {
                const mintedPyroWeth = await callPyroWethProxy({
                    method: 'calculateMintedPyroWeth',
                    args: [outputValToUse],
                    overrides: { from: activeAccountAddress },
                })
                pyroTokensRequired = bigFactor * BigInt(mintedPyroWeth)
            } else {
                const pyroToken = await API.getPyroToken(inputAddress, networkName)
                const redeemRate = BigInt(await pyroToken.redeemRate().call({ from: activeAccountAddress }))
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

    const swapValidationCallback = useCallback(() => {
        if (independentFieldState === "validating swap") {
            try {
                if (!inputEnabled && swapState === SwapState.POSSIBLE) {
                    setSwapState(SwapState.DISABLED)
                } else {
                    //check pyrotokens balances
                    const balanceOfInput = parseFloat(API.fromWei(
                        minting
                            ?
                            baseTokenBalances.filter(b => b.address === inputAddress)[0].balance
                            :
                            pyroTokenBalances.filter(b => b.address === inputAddress)[0].balance
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
    }, [independentFieldState, inputEnabled, swapState, baseTokenBalances?.length, inputAddress, inputValue])

    useEffect(() => {
        swapValidationCallback()
    }, [independentFieldState, inputEnabled, swapState, baseTokenBalances?.length, inputAddress, inputValue])

    useEffect(() => {
        setIndependentFieldState("validating swap")
    }, [inputEnabled])

    const fromBalance = minting ? baseTokenBalances.filter(t => t.address.toLowerCase() === inputAddress.toLowerCase()) : pyroTokenBalances.filter(t => t.address.toLowerCase() === inputAddress.toLowerCase())
    const toBalance = minting ? pyroTokenBalances.filter(t => t.address.toLowerCase() === outputAddress.toLowerCase()) : baseTokenBalances.filter(t => t.address.toLowerCase() === outputAddress.toLowerCase())

    const swapAction = async () => {
        if (swapState === SwapState.POSSIBLE && inputEnabled) {
            setSwapClicked(true)
            return;
        } else if (!inputEnabled) {
            const addressToUse = isOutputEth ? pyroWethProxy.address : (minting ? outputAddress : inputAddress)
            await API.enableToken(
                inputAddress,
                activeAccountAddress || "",
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
        updateIndependentFromField('')
        updateIndependentToField('')
        setInputAddress(address)
    }
    const setNewMenuOutputAddress = (address: string) => {
        updateIndependentFromField('')
        updateIndependentToField('')
        setOutputAddress(address)
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
                                    <TokenSelector pyro={!minting} network={networkName} setAddress={setNewMenuInputAddress} tokenImage={minting ? addressToBaseToken(inputAddress).image : addressToPyroToken(inputAddress).image}
                                        scale={0.65} mobile balances={minting ? baseTokenBalances : pyroTokenBalances} />
                                </Grid>
                                <Grid item onClick={() => setFlipClicked(true)} >
                                    <img width={100} src={swapping ? animatedLogo.image : staticLogo.image} className={classes.pyroShieldMobileAnimated} />
                                </Grid>
                                <Grid item>
                                    <TokenSelector pyro={minting} network={networkName} balances={minting ? pyroTokenBalances : baseTokenBalances} setAddress={setNewMenuOutputAddress} tokenImage={!minting ? addressToBaseToken(outputAddress).image : addressToPyroToken(outputAddress).image} scale={0.65} mobile />
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
                                        <TokenSelector pyro={!minting} balances={minting ? baseTokenBalances : pyroTokenBalances} network={networkName} setAddress={setNewMenuInputAddress} tokenImage={minting ? addressToBaseToken(inputAddress).image : addressToPyroToken(inputAddress).image} scale={0.8} />
                                    </Grid>
                                    <Grid item>
                                        <div className={classes.pyroShieldContainer} >
                                            <Tooltip title={swapping ? "" : "FLIP TOKEN ORDER"} arrow>
                                                <img width={160} src={swapping ? animatedLogo.image : staticLogo.image} className={classes.pyroShield} onClick={() => setFlipClicked(true)} />

                                            </Tooltip>
                                        </div>
                                    </Grid>
                                    <Grid item>
                                        <TokenSelector pyro={minting} balances={minting ? pyroTokenBalances : baseTokenBalances} network={networkName} setAddress={setNewMenuOutputAddress} tokenImage={minting ? addressToPyroToken(outputAddress).image : addressToBaseToken(outputAddress).image} scale={0.8} />
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
