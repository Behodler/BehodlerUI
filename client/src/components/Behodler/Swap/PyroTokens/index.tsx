import * as React from 'react'
import { Grid, Button, IconButton } from '@material-ui/core'
import { useEffect, useContext, useState, useCallback } from 'react'
import { WalletContext } from "../../../Contexts/WalletStatusContext"
import ExtendedTextField from "./ExtendedTextField"
import { Images as PyroImages } from './PyroImageLoader'
import { Images as BaseImages } from './ImageLoader'
import tokenListJSON from "../../../../blockchain/behodlerUI/baseTokens.json"
import API from '../../../../blockchain/ethereumAPI'
import BigNumber from 'bignumber.js'
import SwapVertIcon from '@material-ui/icons/SwapVert';

export interface basePyroPair {
    base: string
    pyro: string
    name: string
}
interface props {
    tokens: basePyroPair[]
}

interface tokenPair {
    address: string
    name: string
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
const bigZero = BigInt(0)
export default function PyroTokens(props: props) {

    const walletContextProps = useContext(WalletContext)
    const tokenList: any[] = tokenListJSON[walletContextProps.networkName]
  //  const indexOfWeth = tokenList.findIndex(item => item.name.toLowerCase().indexOf('weth') !== -1)

    const baseTokenDropDownList = tokenList
        .filter(filterPredicate)
        .filter((b, i) => {
            // if (i === indexOfWeth)
            //     return false

            const pair = props.tokens.filter(t => t.base.toLowerCase().trim() === b.address.toLowerCase().trim())[0]
            return pair.name !== null
        })
        .map((t: tokenPair, i) => {
            let item = { ...t, image: BaseImages[i] }
            return item
        })

    const pyroTokenDropDownList = baseTokenDropDownList
        .map((t, i) => {
            const pair = props.tokens.filter(p => p.base.toLowerCase().trim() === t.address.toLowerCase().trim())[0]
            return { name: pair.name, address: pair.pyro, image: PyroImages[i] }
        })

    const [pyroTokenValid, setPyroTokenValid] = useState<boolean>(true)
    const [baseTokenValid, setBaseTokenValid] = useState<boolean>(true)
    const [pyroTokenValue, setPyroTokenValue] = useState<string>("0")
    const [baseTokenValue, setBaseTokenValue] = useState<string>("0")
    const [pyroTokenEnabled, setPyroTokenEnabled] = useState<boolean>(true)
    const [baseTokenEnabled, setBaseTokenEnabled] = useState<boolean>(false)
    const [pyroTokenAddress, setPyroTokenAddress] = useState<string>(pyroTokenDropDownList[0].address || '')
    const [baseTokenAddress, setBaseTokenAddress] = useState<string>(baseTokenDropDownList[0].address || '')
    const [redeemClicked, setRedeemClicked] = useState<boolean>(false)

    const [baseToPyro, setBaseToPyro] = useState<boolean>(true)
    const [selectionChange, setSelectionChange] = useState<boolean>(!baseToPyro)
    const [baseSelectionChange, setBaseSelectionChange] = useState<boolean>(baseToPyro)
    const [baseTokenName, setBaseTokenName] = useState<string>("")
    const [mintClicked, setMintClicked] = useState<boolean>(false)
    const [baseRate, setBaseRate] = useState<string>('')
    const [pyroRate, setPyroRate] = useState<string>('')

    const bigPyroTokenValue = new BigNumber(pyroTokenValue)
    const bigBaseTokenValue = new BigNumber(baseTokenValue)

    const redeemPossible = pyroTokenValid && baseTokenValid && !bigPyroTokenValue.isNaN()
    const pyroTokenReadyToRedeem = pyroTokenValid && !bigPyroTokenValue.isNaN() && !baseToPyro
    const redeemEnabled = redeemPossible && pyroTokenEnabled
    const pyroTokenValWei = pyroTokenValid && !bigPyroTokenValue.isNaN() && bigPyroTokenValue.isGreaterThanOrEqualTo("0") ? API.toWei(pyroTokenValue) : "0"
    const mintPossible = baseTokenValid && bigBaseTokenValue.isPositive()

    const primaryOptions = { from: walletContextProps.account, gas: "150000" }

    const handlePyrotokenSelectionChange = (address: string) => {
        setSelectionChange(true)
        setPyroTokenAddress(address)
    }

    const handleBaseTokenSelectionChange = (address: string) => {
        setBaseSelectionChange(true)
        setBaseTokenAddress(address)
    }

    const nameCallback = useCallback(async () => {
        if (baseToPyro) {
            try {
                let symbol = await API.getTokenSymbol(baseTokenAddress)
                setBaseTokenName(symbol)
            }
            catch {
                setBaseTokenName('')
            }

        }
        else {
            let pyro = await API.getPyroToken(pyroTokenAddress, walletContextProps.networkName)
            setBaseTokenName(await pyro.symbol().call())
        }
    }, [pyroTokenAddress, baseTokenAddress, baseToPyro])

    useEffect(() => {
        nameCallback()
    }, [pyroTokenAddress, baseTokenAddress, baseToPyro])
    const changeBaseToken = useCallback(async () => {
        if (selectionChange) {
            const item = props.tokens.filter(i => i.pyro === pyroTokenAddress)[0]
            setBaseTokenAddress(item.base)
            setSelectionChange(false)

        }
    }, [selectionChange])

    useEffect(() => {
        changeBaseToken()
    }, [selectionChange])

    const changePyroToken = useCallback(async () => {
        const item = props.tokens.filter(i => i.base === baseTokenAddress)[0]
        setPyroTokenAddress(item.pyro)
        setBaseSelectionChange(false)

    }, [baseSelectionChange])

    useEffect(() => {
        changePyroToken()
    }, [baseSelectionChange])


    const redeemRateCallback = useCallback(async () => {
        const pToken = await API.getPyroToken(pyroTokenAddress, walletContextProps.networkName)
        const baseBalance = BigInt(await API.getTokenBalance(baseTokenAddress, pyroTokenAddress, false, 18))
        const pTokenSupply = BigInt((await pToken.totalSupply().call()).toString())
        const bigOne = BigInt(100000)
        if (baseBalance == bigZero || pTokenSupply == bigZero) {
            setBaseRate("1")
            setPyroRate("0.98")
        } else {
            const py = parseFloat(((baseBalance * bigOne) / pTokenSupply).toString()) / 100000
            const base = parseFloat(((pTokenSupply * bigOne) / baseBalance).toString()) / 100000
            setBaseRate(base.toString())
            setPyroRate(py.toString())
        }

    }, [baseTokenAddress, pyroTokenAddress])

    useEffect(() => {

        redeemRateCallback()
    }, [baseTokenAddress, pyroTokenAddress])

    const WETH10 = '0x4f5704D9D2cbCcAf11e70B34048d41A0d572993F'
    const mintClickedCallback = useCallback(async () => {
        const baseTokenWei = API.toWei(baseTokenValue)
        if (mintClicked) {
            const ptoken = await API.getPyroToken(pyroTokenAddress, walletContextProps.networkName)
            if (baseTokenAddress === WETH10) {
                walletContextProps.contracts.behodler.Behodler2.Weth10.deposit().send({ from: walletContextProps.account, value: baseTokenWei, gas: "150000" },
                    () => ptoken.mint(baseTokenWei).send({ from: walletContextProps.account, gas: "150000" }, clearInput))
            } else {
                ptoken.mint(baseTokenWei).send({ from: walletContextProps.account, gas: "150000" }, clearInput)
            }
            setMintClicked(false)
        }
    }, [mintClicked])

    useEffect(() => {
        mintClickedCallback()
    })

    const redeemClickCallback = useCallback(async () => {
        setRedeemClicked(false)
        const pyroToken = await API.getPyroToken(pyroTokenAddress, walletContextProps.networkName)
        await pyroToken.redeem(pyroTokenValWei).send(primaryOptions, () => {
            if (baseTokenName === 'Eth') {
                pyroToken.redeem(pyroTokenValWei).send(primaryOptions, () => {
                    walletContextProps.contracts.behodler.Behodler2.Weth10.balanceOf(walletContextProps.account)
                        .then(bal => {
                            walletContextProps.contracts.behodler.Behodler2.Weth10.withdraw(bal).send(primaryOptions, () => {
                                clearInput()
                            })
                        })
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



    const mintCalculateCallback = useCallback(async () => {
        if (mintPossible && baseToPyro && baseTokenEnabled) {

            const toMint = parseFloat(baseTokenValue) / parseFloat(pyroRate)
            setPyroTokenValue(toMint.toString())
        }
    }, [mintPossible, baseToPyro, baseTokenValue])

    useEffect(() => {
        mintCalculateCallback()
    })

    const redeemCalculateCallback = useCallback(async () => {
        if (redeemPossible && !baseToPyro) {
            const toRedeem = parseFloat(pyroTokenValue) / parseFloat(baseRate)
            setBaseTokenValue(toRedeem.toString())
        }
    }, [redeemPossible, baseToPyro, pyroTokenValue])

    useEffect(() => {
        redeemCalculateCallback()
    })

    const clearInput = () => { setPyroTokenValue(""); setBaseTokenValue(""); setRedeemClicked(false) }
    const pyroExchangeRate = baseToPyro ? { baseAddress: baseTokenAddress, baseName: baseTokenName, ratio: pyroRate, valid: true } : undefined

    const pyroField = <ExtendedTextField label="PyroToken"
        dropDownFields={pyroTokenDropDownList}
        valid={pyroTokenValid || baseToPyro}
        setValid={setPyroTokenValid}
        setValue={setPyroTokenValue}
        setEnabled={setPyroTokenEnabled}
        setTokenAddress={handlePyrotokenSelectionChange}
        address={pyroTokenAddress}
        value={pyroTokenValue}
        clear={clearInput}
        enableCustomMessage="Approve PyroToken"
        exchangeRate={pyroExchangeRate}

        decimalPlaces={18}
        disabledInput={baseToPyro}
        disabledDropDown={baseToPyro}
    />
    const baseExchangeRate = baseToPyro ? undefined : { baseAddress: baseTokenAddress, baseName: baseTokenName, ratio: baseRate, valid: true }
    const baseField = baseTokenAddress === '' ? '' :
        <ExtendedTextField label="Token"
            dropDownFields={baseTokenDropDownList}
            valid={baseTokenValid}
            setValid={setBaseTokenValid}
            setValue={setBaseTokenValue}
            setTokenAddress={handleBaseTokenSelectionChange}
            address={baseTokenAddress}
            value={baseTokenValue}
            addressToEnableFor={pyroTokenAddress}
            clear={clearInput}
            disabledInput={!baseToPyro}
            disabledDropDown={!baseToPyro}
            decimalPlaces={18}
            setEnabled={setBaseTokenEnabled}
            exchangeRate={baseExchangeRate}
        />

    const order = baseToPyro ? [baseField, pyroField] : [pyroField, baseField]

    return <Grid
        container
        direction="column"
        justify="space-between"
        alignItems="center"
        spacing={3}>
        <Grid item>
            {order[0]}
        </Grid >
        <Grid item>
            <IconButton aria-label="delete" onClick={() => { clearInput(); setBaseToPyro(!baseToPyro) }}>
                <SwapVertIcon color="secondary" />
            </IconButton>
        </Grid>
        <Grid item>
            {order[1]}
        </Grid>
        <Grid item>
            {redeemEnabled && !baseToPyro ? <Button variant="contained" color="secondary" onClick={() => setRedeemClicked(true)}>Redeem</Button> : <div></div>}
            {mintPossible && baseToPyro ? <Button variant="contained" color="primary" onClick={() => setMintClicked(true)}>Mint</Button> : <div></div>}
        </Grid>
    </Grid >
}
