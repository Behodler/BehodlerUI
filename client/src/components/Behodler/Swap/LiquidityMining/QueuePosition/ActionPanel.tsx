import { Button, createStyles, Divider, Grid, /*InputAdornment,*/ makeStyles, TextField, Theme, Tooltip } from '@material-ui/core';
import React, { useContext, useState, useEffect, useCallback } from 'react';
import API from 'src/blockchain/ethereumAPI';
import { WalletContext } from 'src/components/Contexts/WalletStatusContext';
import { formatSignificantDecimalPlaces } from 'src/util/jsHelpers';


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        margin: {
            margin: theme.spacing(1),
        },
        maxButton: {
            alignItems: 'center',
            backgroundColor: 'rgba(240, 240, 255,0.7)',
            border: '0px',
            borderRadius: '12px',
            boxShadow: 'rgb(14 14 44 / 40%) 0px -1px 0px inset',
            color: 'rgb(10, 20, 30)',
            cursor: 'pointer',
            display: 'inline-flex',
            fontFamily: 'inherit',
            fontSize: '12px',
            fontWeight: 600,
            width: 'max-content',
            height: '32px',
            lineHeight: '1',
            letterSpacing: '0.03em',
            '-webkit-box-pack': 'center',
            justifyContent: 'center',
            outline: '0px',
            padding: '0px 16px',
            opacity: 1,
            margin: 10
        }
    }))


export default function ActionPanel(props: { inputToken: string, tokenSymbol: string, maxInputToken: string, rewardToken: string, pendingEye: string }) {
    const walletContextProps = useContext(WalletContext)
    const [userBalanceOfInput, setUserBalanceOfInput] = useState<string>('0')
    const [purchaseValue, setPurchaseValue] = useState<string>('')
    const [lpBalance, setLPbalance] = useState<string>('0')
    const [queueEnabled, setQueueEnabled] = useState<boolean>(false)
    const [purchaseLPClicked, setPurchaseLPClicked] = useState<boolean>(false)
    const [approveClicked, setApproveclicked] = useState<boolean>(false)
    const [inputApproved, setInputApproved] = useState<boolean>(API.isEth(props.inputToken, walletContextProps.networkName))
    const [latestPositionInQueue, setLatestPositionInQueue] = useState<string>('Not in queue')

    const tokenEffects = API.generateNewEffects(props.inputToken, walletContextProps.account, API.isEth(props.inputToken, walletContextProps.networkName))

    const effect = tokenEffects.balanceOfEffect(walletContextProps.account)

    const subcription = effect.Observable.subscribe(bl => {
        API.fromWei(bl)
        setUserBalanceOfInput(bl)
        return () => {

            subcription.unsubscribe()
        }
    })

    useEffect(() => {
        const effect = API.liquidQueueEffects.latestPositionInQueue(walletContextProps.account)
        const subscription = effect.Observable.subscribe(position => {
            if (position === -1) {
                setLatestPositionInQueue('Not in queue')
            } else {

                setLatestPositionInQueue(`You have LP in the queue`)
            }
            return () => { subscription.unsubscribe() }
        })
        return () => { }
    }, [])


    useEffect(() => {
        const effect = API.liquidQueueEffects.lpBalance(props.inputToken, walletContextProps.account)
        const subscription = effect.Observable.subscribe(bal => {
            setLPbalance(formatSignificantDecimalPlaces(bal, 4))
        })
        return () => { subscription.unsubscribe() }
    }, [])

    const purchaseLPCallback = useCallback(async () => {
        if (purchaseLPClicked) {

            setPurchaseLPClicked(false)
            const purchaseValWei = API.toWei(purchaseValue)

            const options = (API.isEth(props.inputToken, walletContextProps.networkName)) ? { from: walletContextProps.account, value: purchaseValWei }
                : { from: walletContextProps.account }
            try {
                await walletContextProps.contracts.behodler.Behodler2.LiquidQueue.MintingModule.purchaseLP(props.inputToken, purchaseValWei).send(options)
            } catch { }
        }

    }, [purchaseLPClicked])

    useEffect(() => { purchaseLPCallback() }, [purchaseLPClicked])

    const approveCallback = useCallback(async () => {
        if (approveClicked) {
            const token = await API.getToken(props.inputToken, walletContextProps.networkName)
            try {
                await token.approve(walletContextProps.contracts.behodler.Behodler2.LiquidQueue.MintingModule.address, API.UINTMAX).send({ from: walletContextProps.account })
            } catch { }
            setApproveclicked(false)
        }
    }, [approveClicked])

    useEffect(() => {
        approveCallback()
    }, [approveClicked])
    const floatBalance = parseFloat(userBalanceOfInput)
    const floatMax = parseFloat(props.maxInputToken)

    useEffect(() => {
        if (API.isEth(props.inputToken, walletContextProps.networkName))
            return
        const tokenEffects = API.generateNewEffects(props.inputToken, walletContextProps.account, false)
        const effect = tokenEffects.allowance(walletContextProps.account, walletContextProps.contracts.behodler.Behodler2.LiquidQueue.MintingModule.address)
        const subscription = effect.Observable.subscribe(all => {
            const bigAll = BigInt(all.toString())
            const bigBal = BigInt(API.fromWei(userBalanceOfInput))
            setInputApproved(bigAll > bigBal)
        })
        return () => { subscription.unsubscribe(); }
    }, [])
    let max = 0
    if (!isNaN(floatBalance) && !isNaN(floatMax)) {
        max = floatBalance < floatMax ? floatBalance : floatMax
    }

    return <div>
        <Grid
            container
            direction="column"
            justify="flex-start"
            alignItems="stretch"
            spacing={2}>
            <Grid item>
                <InputText setEnterQueueEnabled={setQueueEnabled} absoluteMax={max.toString()} inputBalance={userBalanceOfInput} tokenSymbol={props.tokenSymbol} text={purchaseValue} setText={setPurchaseValue} />
            </Grid>
            <Grid item>
                <Grid
                    container
                    direction="column"
                    justify="center"
                    alignItems="center" >
                    <Grid item>
                        {inputApproved ? <Button variant="contained" disabled={!queueEnabled} color="primary" onClick={() => setPurchaseLPClicked(true)}>Enter Queue</Button> :
                            <Button variant="outlined" color="secondary" onClick={() => setApproveclicked(true)}>Approve</Button>}
                    </Grid>
                </Grid>
            </Grid>
            <Grid>
                <Divider />
            </Grid>
            <Grid item>
                <JustifiedRowTwoItems left={`${props.tokenSymbol} balance`} right={userBalanceOfInput}></JustifiedRowTwoItems>
            </Grid>
            <Grid item>
                <JustifiedRowTwoItems left={`${props.rewardToken} balance`} right={lpBalance}></JustifiedRowTwoItems>
            </Grid>
            <Grid item>
                <JustifiedRowTwoItems left={`Pending EYE rewards`} right={formatSignificantDecimalPlaces(props.pendingEye, 4)}></JustifiedRowTwoItems>
            </Grid>
            <Grid item>
                <JustifiedRowTwoItems left={`Participation`} right={latestPositionInQueue}></JustifiedRowTwoItems>
            </Grid>
        </Grid>
    </div>
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
        fontWeight: 'bold',
    },
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

interface InputTextProps {
    inputBalance: string
    absoluteMax: string
    tokenSymbol: string
    setText: (t: string) => any
    text: string,
    setEnterQueueEnabled: (e: boolean) => any
}

function InputText(props: InputTextProps) {
    const classes = useStyles()
    const regulateSetText = (text) => {
        let floatText = parseFloat(text)
        props.setEnterQueueEnabled(!isNaN(floatText) && floatText > 0 && parseFloat(props.absoluteMax) >= floatText)
        props.setText(text)
    }
    return <div className={classes.margin}>
        <Grid container spacing={1} alignItems="flex-end">
            <Grid item>
                <TextField value={props.text} onChange={(event) => regulateSetText(event.target.value || '')} id="input-with-icon-grid" label={`${props.tokenSymbol} amount to queue`} />
            </Grid>
            <Grid item>
                <Button onClick={() => regulateSetText(props.absoluteMax)} className={classes.maxButton}>Max</Button>
            </Grid>
        </Grid>
    </div>

}