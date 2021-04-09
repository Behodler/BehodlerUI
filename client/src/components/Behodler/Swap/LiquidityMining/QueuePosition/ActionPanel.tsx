import { Button, createStyles, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, Divider, Grid, /*InputAdornment,*/ makeStyles, TextField, Theme, Tooltip } from '@material-ui/core';
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
        },
        gradientButton: {
            margin: '10px',
            fontFamily: '"Arial Black", Gadget, sans-serif',
            fontSize: '15px',
            padding: '10px',
            textAlign: 'center',
            textTransform: 'uppercase',
            transition: '0.5s',
            backgroundSize: '200% auto',
            color: '#FFF',
            boxShadow: '0 0 20px #eee',
            borderRadius: '10px',
            width: '70px',
            cursor: 'pointer',
            display: 'inline-block',
            backgroundImage: 'linear-gradient(to right top, #d16ba5, #c777b9, #ba83ca, #aa8fd8, #9a9ae1, #8aa7ec, #79b3f4, #69bff8, #52cffe, #41dfff, #46eefa, #5ffbf1)',
            '&:hover': {
                boxShadow: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
                margin: '8px 10px 12px',
            }
        }
    }),
)


export default function ActionPanel(props: { inputToken: string, tokenSymbol: string, maxInputToken: string, rewardToken: string, pendingEye: string }) {
    const classes = useStyles()
    const walletContextProps = useContext(WalletContext)
    const [userBalanceOfInput, setUserBalanceOfInput] = useState<string>('0')
    const [purchaseValue, setPurchaseValue] = useState<string>('')
    const [lpBalance, setLPbalance] = useState<string>('0')
    const [queueEnabled, setQueueEnabled] = useState<boolean>(false)
    const [purchaseLPClicked, setPurchaseLPClicked] = useState<boolean>(false)
    const [approveClicked, setApproveclicked] = useState<boolean>(false)
    const [inputApproved, setInputApproved] = useState<boolean>(API.isEth(props.inputToken, walletContextProps.networkName))
    const [zapApproved, setZapApproved] = useState<boolean>(false)
    const [zapClicked, setZapClicked] = useState<boolean>(false)
    const [showZapConfirmation, setShowZapConfirmation] = useState<boolean>(false)
    const [approveZapClicked, setApproveZapClicked] = useState<boolean>(false)
    const [latestPositionInQueue, setLatestPositionInQueue] = useState<string>('Not in queue')

    const [uniPair, setUniPair] = useState<string>('')
    const tokenEffects = API.generateNewEffects(props.inputToken, walletContextProps.account, API.isEth(props.inputToken, walletContextProps.networkName))
    console.log('is eth: ' + API.isEth(props.inputToken, walletContextProps.networkName))
    const effect = tokenEffects.balanceOfEffect(walletContextProps.account)

    const subcription = effect.Observable.subscribe(bl => {
        API.fromWei(bl)
        setUserBalanceOfInput(bl)
        return () => {
            effect.cleanup()
            subcription.unsubscribe()
        }
    })

    const zapCallback = useCallback(async () => {
        if (zapClicked) {
            setZapClicked(false)
            setShowZapConfirmation(true)
        }
    }, [zapClicked])
    useEffect(() => { zapCallback() }, [zapClicked])

    const uniPairCallback = useCallback(async () => {
        const outputAddress = await walletContextProps.contracts.behodler.Behodler2.LiquidQueue.MintingModule.inputOutputToken(props.inputToken).call()
        const pair = await walletContextProps.contracts.behodler.Behodler2.LiquidQueue.UniswapV2Factory.getPair(props.inputToken, outputAddress).call()
        setUniPair(pair)
    }, [])

    useEffect(() => { uniPairCallback() }, [])

    useEffect(() => {
        const effect = API.liquidQueueEffects.latestPositionInQueue(walletContextProps.account)
        const subscription = effect.Observable.subscribe(position => {
            if (position === -1) {
                setLatestPositionInQueue('Not in queue')
            } else {
               
                setLatestPositionInQueue(`You have LP in the queue`)
            }
            return () => { effect.cleanup(); subscription.unsubscribe() }
        })
        return () => { }
    }, [])

    const approveZapCallback = useCallback(async () => {
        if (approveZapClicked) {
            setApproveZapClicked(false)
            const lpToken = await API.getToken(uniPair, walletContextProps.networkName)
            await lpToken.approve(walletContextProps.contracts.behodler.Behodler2.Behodler2.address, API.UINTMAX).send({ from: walletContextProps.account })
        }
    }, [approveZapClicked])
    useEffect(() => { approveZapCallback() }, [approveZapClicked])

    useEffect(() => {
        if (uniPair.length > 3) {
            const uniPairMonitor = API.generateNewEffects(uniPair, walletContextProps.account, false)
            const effect = uniPairMonitor.allowance(walletContextProps.account, walletContextProps.contracts.behodler.Behodler2.Behodler2.address)
            const subscription = effect.Observable.subscribe(allowance => {
                const bigBal = BigInt(userBalanceOfInput)
                setZapApproved(BigInt(allowance) > bigBal)
            })

            return () => { effect.cleanup(); subscription.unsubscribe() }
        }
        return () => { }
    }, [uniPair])

    useEffect(() => {
        const effect = API.liquidQueueEffects.lpBalance(props.inputToken, walletContextProps.account)
        const subscription = effect.Observable.subscribe(bal => {
            setLPbalance(formatSignificantDecimalPlaces(bal, 4))
        })
        return () => { effect.cleanup(); subscription.unsubscribe() }
    }, [])

    const purchaseLPCallback = useCallback(async () => {
        if (purchaseLPClicked) {
            setPurchaseLPClicked(false)
            const purchaseValWei = API.toWei(purchaseValue)
            const options = (API.isEth(props.inputToken, walletContextProps.networkName)) ? { from: walletContextProps.account, value: purchaseValWei }
                : { from: walletContextProps.account }
            await walletContextProps.contracts.behodler.Behodler2.LiquidQueue.MintingModule.purchaseLP(props.inputToken, purchaseValWei).send(options)
        }

    }, [purchaseLPClicked])

    useEffect(() => { purchaseLPCallback() }, [purchaseLPClicked])

    const approveCallback = useCallback(async () => {
        if (approveClicked) {
            const token = await API.getToken(props.inputToken, walletContextProps.networkName)
            await token.approve(walletContextProps.contracts.behodler.Behodler2.LiquidQueue.MintingModule.address, API.UINTMAX).send({ from: walletContextProps.account })
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
        return () => { subscription.unsubscribe(); effect.cleanup() }
    }, [])
    let max = 0
    if (!isNaN(floatBalance) && !isNaN(floatMax)) {
        max = floatBalance < floatMax ? floatBalance : floatMax
    }

    return <div>{
        uniPair.length < 3 ? <div></div> :
            <ZapDialog show={showZapConfirmation} close={() => setShowZapConfirmation(false)} lpTokenAddress={uniPair} LPname={props.rewardToken} />
    }
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
            <Grid item>
                <Tooltip title={<h3 style={{ color: "white", fontWeight: 'bold' }}>Instantly convert your LP to SCX to save on gas</h3>} >
                    <Grid
                        container
                        direction="column"
                        justify="center"
                        alignItems="center"
                    >
                        <Grid item>{zapApproved ? <Button className={classes.gradientButton} variant="contained" onClick={() => setZapClicked(true)} >ZAP</Button>
                            : <Button variant="outlined" color="secondary" onClick={() => setApproveZapClicked(true)} >Approve Zap</Button>
                        }

                        </Grid>
                    </Grid>
                </Tooltip>
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

interface ZapDialogProps {
    show: boolean
    close: () => void
    lpTokenAddress: string,
    LPname: string
}

function ZapDialog(props: ZapDialogProps) {
    /*
    1. get lp token
    2. get current user balance
    3. estimate behodler SCX generation
    4. Tell user
    5. On user confirm, trigger transaction
    6. On user reject, don't
    7. After any action close dialog
    */
    /*
    const scx = await behodler.addLiquidity(inputAddress, inputValWei).call(isEthPredicate(inputAddress) ? ethOptions : primaryOptions)
     const scxString = scx.toString()
     setOutputValueWei(scxString)
     setOutputValue(API.fromWei(scxString))
     setTerms(inputValWei, scxString)
    */
    const walletContextProps = useContext(WalletContext)
    const [scxEstimate, setSCXEstimate] = useState<string>('')
    const [userBalance, setUserBalance] = useState<string>('')
    const [yesClicked, setYesClicked] = useState<boolean>(false)
    const [popupReady, setPopupReady] = useState<boolean>(false)
    const primaryOptions = { from: walletContextProps.account }
    const behodler = walletContextProps.contracts.behodler.Behodler2.Behodler2
    if (2 < 1) {
        setSCXEstimate('2');
    }
    const estimationCallback = useCallback(async () => {
        if (props.show) {
            const lpToken = await API.getToken(props.lpTokenAddress, walletContextProps.networkName)
            const currentUserBalance = (await lpToken.balanceOf(walletContextProps.account).call()).toString()
            console.log('current user balance ' + currentUserBalance)
            setUserBalance(API.fromWei(currentUserBalance))
            const scx = await behodler.addLiquidity(props.lpTokenAddress, currentUserBalance).call(primaryOptions)
            const scxString = scx.toString()
            setSCXEstimate(API.fromWei(scxString))
            setPopupReady(true)
        }
    }, [props.show])

    useEffect(() => { estimationCallback() })

    const yesClickedCallback = useCallback(async () => {
        if (yesClicked) {
            setYesClicked(false)
            props.close()
            await behodler.addLiquidity(props.lpTokenAddress, API.toWei(userBalance)).send(primaryOptions)
        }
    }, [yesClicked])

    useEffect(() => { yesClickedCallback() })

    return (<Dialog
        open={props.show && popupReady}
        onClose={() => props.close()}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
    >
        <DialogTitle id="alert-dialog-title">{`Would you like to zap ${formatSignificantDecimalPlaces(userBalance, 5)} ${props.LPname} into ${formatSignificantDecimalPlaces(scxEstimate, 5)} Scarcity (SCX)?`}</DialogTitle>
        <DialogContent>
            <DialogContentText id="alert-dialog-description">
                Unwinding LP tokens on Uniswap can consume a large amount of gas. Why not Zap it straight into Behodler in return for Scarcity?
      </DialogContentText>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => props.close()} color="primary">
                Cancel
      </Button>
            <Button onClick={() => setYesClicked(true)} color="primary" autoFocus>
                Zap it!
      </Button>
        </DialogActions>
    </Dialog>)
}