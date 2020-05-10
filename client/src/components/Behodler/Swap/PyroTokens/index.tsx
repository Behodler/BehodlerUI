import * as React from 'react'
import { Grid, Button } from '@material-ui/core'
import { useEffect, useContext, useState, useCallback } from 'react'
import { WalletContext } from "../../../Contexts/WalletStatusContext"
import ExtendedTextField from "../TradingBox/ExtendedTextField"
import { Images as PyroImages } from './PyroImageLoader'
import { Images as BaseImages } from '../TradingBox/ImageLoader'
import tokenListJSON from "../../../../blockchain/behodlerUI/baseTokens.json"
import API from '../../../../blockchain/ethereumAPI'
import BigNumber from 'bignumber.js'
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';

export interface basePyroPair {
    base: string
    pyro: string
    name: string
}
interface props {
    tokens: basePyroPair[]
}

export const filterPredicate = ((item) => {
    const lower = item.name.toLowerCase()
    switch (lower) {
        case 'scarcity':
        case 'weidai':
        case 'dai':
            return false
        default: return true
    }

})

export default function PyroTokens(props: props) {
    const walletContextProps = useContext(WalletContext)
    const tokenList: any[] = tokenListJSON[walletContextProps.networkName]
    const indexOfWeth = tokenList.findIndex(item => item.name.toLowerCase().indexOf('weth') !== -1)

    const baseTokenDropDownList = tokenList
        .map((t, i) => {
            let item = { ...t, image: BaseImages[i] }
            if (i === indexOfWeth) {
                item.name = "Eth"
            }
            return item
        })
        .filter(filterPredicate)

    const pyroTokenDropDownList = baseTokenDropDownList.map((t, i) => {
        const pair = props.tokens.filter(p => p.base.toLowerCase().trim() === t.address.toLowerCase().trim())[0]
        return { name: pair.name, address: pair.pyro, image: PyroImages[i] }
    })

    const [pyroTokenValid, setPyroTokenValid] = useState<boolean>(true)
    const [baseTokenValid, setBaseTokenValid] = useState<boolean>(true)
    const [pyroTokenValue, setPyroTokenValue] = useState<string>("")
    const [baseTokenValue, setBaseTokenValue] = useState<string>("")
    const [pyroTokenEnabled, setPyroTokenEnabled] = useState<boolean>(false)
    const [pyroTokenAddress, setPyroTokenAddress] = useState<string>(pyroTokenDropDownList[0].address)
    const [baseTokenAddress, setBaseTokenAddress] = useState<string>(baseTokenDropDownList[1].address)
    const [redeemClicked, setRedeemClicked] = useState<boolean>(false)
    const [redeemRate, setRedeemRate] = useState<string>("")
    const [selectionChange, setSelectionChange] = useState<boolean>(true)
    const [baseTokenName, setBaseTokenName] = useState<string>("")

    const bigPyroTokenValue = new BigNumber(pyroTokenValue)
    const bigBaseTokenValue = new BigNumber(baseTokenValue)

    const redeemPossible = pyroTokenValid && baseTokenValid && !bigPyroTokenValue.isNaN() && !bigBaseTokenValue.isNaN()
    const pyroTokenReadyToRedeem = pyroTokenValid && !bigPyroTokenValue.isNaN()
    const redeemEnabled = redeemPossible && pyroTokenEnabled
    const pyroTokenValWei = pyroTokenValid && !bigPyroTokenValue.isNaN() && bigPyroTokenValue.isGreaterThanOrEqualTo("0") ? API.toWei(pyroTokenValue) : "0"

    const primaryOptions = { from: walletContextProps.account }

    const handlePyrotokenSelectionChange = (address: string) => {
        setSelectionChange(true)
        setPyroTokenAddress(address)
    }

    const changeBaseToken = useCallback(async () => {
        if (selectionChange) {
            const baseToken = await walletContextProps.contracts.behodler.PyroTokenRegistry.pyroTokenMapping(pyroTokenAddress).call(primaryOptions)
            setBaseTokenAddress(baseToken)
            setSelectionChange(false)
            setBaseTokenName(baseTokenDropDownList.filter(b => b.address.toLowerCase().trim() == baseToken.toLowerCase().trim())[0].name)
        }
    }, [selectionChange])

    useEffect(() => {
        changeBaseToken()
    }, [selectionChange])

    useEffect(() => {
        const effect = API.bellowsEffects.getRedeemRateEffect(pyroTokenAddress)
        const subscription = effect.Observable.subscribe(r => {
            const rp = new BigNumber(r).dividedBy(10000)
            setRedeemRate(rp.toString())
        })
        return () => { subscription.unsubscribe(); effect.cleanup() }
    }, [selectionChange])

    const redeemClickCallback = useCallback(async () => {
        setRedeemClicked(false)

        await walletContextProps.contracts.behodler.Bellows.blast(pyroTokenAddress, pyroTokenValWei).send(primaryOptions, () => {
            const ethAmount = API.toWei(baseTokenValue)
            if (baseTokenName === 'Eth') {
                walletContextProps.contracts.behodler.Weth.withdraw(ethAmount).send(primaryOptions, () => {
                    clearInput()
                })
            } else {
                clearInput()
            }
        })

    }, [redeemClicked, pyroTokenValue])

    useEffect(() => {
        if (redeemClicked && pyroTokenReadyToRedeem) {
            redeemClickCallback()
        }
        setRedeemClicked(false)
    }, [redeemClicked])

    useEffect(() => {
        if (pyroTokenReadyToRedeem) {
            setBaseTokenValue(new BigNumber(redeemRate).times(new BigNumber(pyroTokenValue)).toString())
        }
    }, [pyroTokenReadyToRedeem, pyroTokenValue])

    const clearInput = () => { setPyroTokenValue(""); setBaseTokenValue(""); setRedeemClicked(false) }

    return <Grid
        container
        direction="column"
        justify="space-between"
        alignItems="center"
        spacing={3}>
        <Grid item>
            <ExtendedTextField label="PyroToken"
                dropDownFields={pyroTokenDropDownList}
                valid={pyroTokenValid}
                setValid={setPyroTokenValid}
                setValue={setPyroTokenValue}
                setEnabled={setPyroTokenEnabled}
                setTokenAddress={handlePyrotokenSelectionChange}
                address={pyroTokenAddress}
                value={pyroTokenValue}
                clear={clearInput}
                enableCustomMessage="Enable PyroToken to be redeemed"
                exchangeRate={{ baseAddress: baseTokenAddress, baseName: baseTokenName, ratio: redeemRate, valid: redeemEnabled }}
                addressToEnableFor={walletContextProps.contracts.behodler.Bellows.address}
            />
        </Grid >
        <Grid item>
            <ArrowDownwardIcon color="secondary" />
        </Grid>
        <Grid item>
            {baseTokenAddress === '' ? '' :
                <ExtendedTextField label="BaseToken (estimated)"
                    dropDownFields={baseTokenDropDownList}
                    valid={baseTokenValid}
                    setValid={setBaseTokenValid}
                    setValue={setBaseTokenValue}
                    setTokenAddress={setBaseTokenAddress}
                    address={baseTokenAddress}
                    value={baseTokenValue}

                    clear={clearInput}
                    disabledInput
                    disabledDropDown
                />}

        </Grid>
        {redeemEnabled ?
            <Grid item>
                <Button variant="contained" color="primary" onClick={() => setRedeemClicked(true)}>REDEEM</Button>
            </Grid>
            : ""}
    </Grid >
}
