import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Grid, IconButton, makeStyles, Tooltip } from '@material-ui/core';
import { WalletContext } from 'src/components/Contexts/WalletStatusContext';
import API from 'src/blockchain/ethereumAPI';
import Eth from '../../../../../images/behodler/3.png'
import SCX from '../../../../../images/behodler/7.png'
import DAI from '../../../../../images/behodler/dai.png'
import EYE from '../../../../../images/behodler_b.png'
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace';
import { formatSignificantDecimalPlaces } from 'src/util/jsHelpers';
// import { ERC20 } from 'src/blockchain/contractInterfaces/ERC20';

//TODO: Get current eye reward, find out tilt token from minting module and then fetch max reward from reward.
// then use uniswap to ask what the max input accepted is
//Give your eye balance

const useHeaderStyles = makeStyles({
    back: {
        margin: -7
    }
})

export default function HeaderStats(props: { inputToken: string, APY: number, eyeActive: boolean, eyePerSecond: string, setVisiblePosition: (p: string | null) => any }) {
    const classes = useHeaderStyles()
    const walletContextProps = useContext(WalletContext)
    const [tokenSymbol, setTokenSymbol] = useState<string>('')
    const [currentEyeBalance, setEyeBalance] = useState<string>()
    const [tiltToken, setTiltToken] = useState<string>('')
    const [maxInputToken, setMaxInputToken] = useState<string>('')
    var addresses = API.getLQInputAddresses(walletContextProps.networkName)
    const keys = Object.keys(addresses)
    if (3 < 2) {
        setEyeBalance(''); setTiltToken('')
        console.log(tokenSymbol + currentEyeBalance + tiltToken)
    }
    let correctKey = ''
    for (var i = 0; i < keys.length; i++) {
        const key = keys[i]
        if (addresses[key].toLowerCase() === props.inputToken.toLowerCase()) {
            correctKey = key
        }

    }

    const eyeEffects = API.generateNewEffects(API.getEYEAddress(walletContextProps.networkName), walletContextProps.account, false)

    const tiltTokenCallback = useCallback(async () => {
        const contract = walletContextProps.contracts.behodler.Behodler2.LiquidQueue.MintingModule
        if (contract.address !== '')
            setTiltToken(await contract.inputTokenTilting(props.inputToken).call())
    }, [])

    useEffect(() => {
        setTokenSymbol(correctKey == 'Scarcity' ? 'SCX' : correctKey.toUpperCase())

        tiltTokenCallback()
        const eyeEffect = eyeEffects.balanceOfEffect(walletContextProps.account)
        const eyeSubscription = eyeEffect.Observable.subscribe(e => {
            setEyeBalance(e)
        })

        return () => {

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
        <Grid
            container
            direction="column"
            justify="flex-start"
            alignItems="stretch"
            spacing={2}
        >
            <Grid item>
                <LeftLeaningColumns>
                    <Grid item>
                        <IconButton onClick={() => props.setVisiblePosition(null)}><KeyboardBackspaceIcon /></IconButton>
                    </Grid>
                    <Grid item className={classes.back}>
                        BACK
                    </Grid>
                </LeftLeaningColumns>
            </Grid>
            <Grid item>
                <ImageHeader imgKey={correctKey} />
            </Grid>
            <Grid item>
                <JustifiedRowTwoItems left={"APY"} right={props.APY + "%"} />
            </Grid>
            <Grid item>
                <JustifiedRowTwoItems left="Reward Token" right="SCX/EYE" />
            </Grid>
            <Grid item>
                <JustifiedRowTwoItems left="Slow Queue Bonus" right="0.003 EYE per second" />
            </Grid>
            <Grid item>
                <JustifiedRowTwoItems left="Deposit Fee" right="0%" />
            </Grid>

            <Grid item>
                <JustifiedRowTwoItems left="Max purchase size" right={formatSignificantDecimalPlaces(maxInputToken, 2)} />
            </Grid>
        </Grid>
    )
}

function LeftLeaningColumns(props: { children: any }) {
    return (
        <Grid
            container
            direction="row"
            justify="flex-start"
            alignItems="center"
        >
            {props.children}
        </Grid>
    )
}

const useImageHeaderStyles = makeStyles({
    image: {
        width: 100,
        margin: 5,

    }, imgheaderText: {
        fontWeight: 'bolder',
        color: '#333',
        fontSize: 24
    }
})

const useImageMap = () => ({
    Dai: DAI,
    Eth: Eth,
    Eye: EYE,
    Scarcity: SCX
})

function ImageHeader(props: { imgKey: string }) {
    const classes = useImageHeaderStyles()
    const imgSrc = useImageMap()
    return (
        <CenteredRow>
            <CenteredColumn>
                <img className={classes.image} src={imgSrc[props.imgKey]} />
            </CenteredColumn>
        </CenteredRow>
    )
}

interface TableProps {
    children?: any,
    className?: string,
    toolTip?: string,
    left?: any,
    right?: any
}

const useRowStyle = makeStyles({
    rightColumn: {
        fontWeight: 'bold'
    }
})

function JustifiedRowTwoItems(props: TableProps) {
    const classes = useRowStyle()
    const component = <Grid
        container
        direction="row"
        justify="space-between"
        alignItems="center"
        spacing={10}
    >
        <Grid item>
            {props.left}
        </Grid>
        <Grid item className={classes.rightColumn}>
            {props.right}
        </Grid>
    </Grid>
    return props.toolTip ? <Tooltip title={props.toolTip}>{component}</Tooltip> : component
}

function CenteredRow(props: TableProps) {
    return <Grid
        container
        direction="row"
        justify="center"
        alignItems="center"
        spacing={4}>
        <Grid item>
            {props.children}
        </Grid>
    </Grid>
}

function CenteredColumn(props: TableProps) {
    return <Grid
        container
        direction="column"
        justify="center"
        alignItems="center"
        className={props.className || ''}
    >
        {props.children}
    </Grid>
}