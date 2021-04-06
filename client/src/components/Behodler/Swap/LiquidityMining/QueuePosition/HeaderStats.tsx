import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Grid, Paper } from '@material-ui/core';
import { WalletContext } from 'src/components/Contexts/WalletStatusContext';
import API from 'src/blockchain/ethereumAPI';
import Eth from '../../../../../images/behodler/3.png'
import SCX from '../../../../../images/behodler/7.png'
import DAI from '../../../../../images/behodler/dai.png'
import EYE from '../../../../../images/behodler_b.png'
// import { ERC20 } from 'src/blockchain/contractInterfaces/ERC20';

//TODO: Get current eye reward, find out tilt token from minting module and then fetch max reward from reward.
// then use uniswap to ask what the max input accepted is
//Give your eye balance
const imageMap = (width: number) => ({
    Dai: <img src={DAI} width={50} />,
    Eth: <img src={Eth} width={50} />,
    Eye: <img src={EYE} width={50} />,
    Scarcity: <img src={SCX} width={50} />
})

export default function HeaderStats(props: { inputToken: string, eyeActive: boolean, eyePerSecond: string }) {
    const walletContextProps = useContext(WalletContext)
    const [tokenSymbol, setTokenSymbol] = useState<string>()
    const [userBalanceOfInput, setUserBalanceOfInput] = useState<string>()
    const [currentEyeBalance, setEyeBalance] = useState<string>()
    const [tiltToken, setTiltToken] = useState<string>('')
    const [maxInputToken, setMaxInputToken] = useState<string>('')
    var addresses = API.getLQInputAddresses(walletContextProps.networkName)
    const keys = Object.keys(addresses)
    if (3 < 2) {
        setUserBalanceOfInput(''); setEyeBalance(''); setTiltToken('')
    }
    let correctKey = ''
    for (var i = 0; i < keys.length; i++) {
        const key = keys[i]
        if (addresses[key].toLowerCase() === props.inputToken.toLowerCase()) {
            correctKey = key
        }

    }
    const tokenEffects = API.generateNewEffects(props.inputToken, walletContextProps.account, correctKey.toLowerCase() === 'eth')
    const eyeEffects = API.generateNewEffects(API.getEYEAddress(walletContextProps.networkName), walletContextProps.account, false)

    const tiltTokenCallback = useCallback(async () => {
        const contract = walletContextProps.contracts.behodler.Behodler2.LiquidQueue.MintingModule
        if (contract.address !== '')
            setTiltToken(await contract.inputTokenTilting(props.inputToken).call())
    }, [])

    useEffect(() => {
        setTokenSymbol(correctKey == 'Scarcity' ? 'SCX' : correctKey.toUpperCase())
        const effect = tokenEffects.balanceOfEffect(walletContextProps.account)
        const subcription = effect.Observable.subscribe(bl => {
            API.fromWei(bl)
            setUserBalanceOfInput(bl)
        })
        tiltTokenCallback()
        const eyeEffect = eyeEffects.balanceOfEffect(walletContextProps.account)
        const eyeSubscription = eyeEffect.Observable.subscribe(e => {
            setEyeBalance(e)
        })

        return () => {
            effect.cleanup()
            subcription.unsubscribe()

            eyeEffect.cleanup()
            eyeSubscription.unsubscribe()
        }
    }, [])

    const maxCallback = useCallback(async () => {
        const inputToken = await API.getToken(props.inputToken, walletContextProps.networkName)
        const outputTokenAddress = await walletContextProps.contracts.behodler.Behodler2.LiquidQueue.MintingModule.inputOutputToken(props.inputToken).call()
        const outputToken = await API.getToken(outputTokenAddress, walletContextProps.networkName)
        const effect = API.liquidQueueEffects.maxInputTokenGivenReward(inputToken, outputToken)
        const subscription = effect.Observable.subscribe(max => {
            setMaxInputToken(max)
        })
        return () => { effect.cleanup(); subscription.unsubscribe() }
    }, [])

    useEffect(() => {
        maxCallback()
    }, [])

    return (
        <Paper>
            <Grid
                container
                direction="column"
                justify="flex-start"
                alignItems="stretch"
            >
                <Grid item>
                    {imageMap(50)[correctKey]}
            symbol {tokenSymbol} <br />
                    <br />
                    <br />
            rewards active: {props.eyeActive.toString()}<br />
                    <br />
            tiltedToken: {tiltToken}<br />
                </Grid>
                <Grid item>
                    user balance {userBalanceOfInput}
                </Grid>
                <Grid item>
                    EYE: {currentEyeBalance}
                </Grid>
                {props.eyeActive ? <Grid item>
                    rewards per second: {API.fromWei(props.eyePerSecond)}
                </Grid> : <div></div>}

                <Grid item>
                    rewards available
                </Grid>
                <Grid item>
                    MAX: {maxInputToken}
                </Grid>
            </Grid>
        </Paper>)
}