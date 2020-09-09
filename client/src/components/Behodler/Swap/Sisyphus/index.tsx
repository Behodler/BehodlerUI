import * as React from 'react'
import { useState, useEffect, useContext } from 'react'
import { WalletContext } from "../../../Contexts/WalletStatusContext"
import { Typography, Grid, Button, Divider, Link } from '@material-ui/core'
import logo from '../../../../images/behodler/sisyphus/logo.png'
import { ValueTextBox } from 'src/components/Common/ValueTextBox'
import Stat from '../Stat'
import API from 'src/blockchain/ethereumAPI'
import BigNumber from 'bignumber.js'
import BuyScarcityProxyDialog from "./BuyScarcityProxyDialog"
interface props {
}

export default function Sisyphus(props: props) {
    const walletContextProps = useContext(WalletContext)
    const [buyoutText, setBuyoutText] = useState<string>("")
    const [currentSisyphus, setCurrentSisyphus] = useState<string>("")
    const [currentBuyoutPrice, setCurrentCurrentBuyoutPrice] = useState<string>("")
    const [originalBuyoutPrice, setOriginalBuyoutPrice] = useState<string>("")
    const [rollBack, setRollBack] = useState<string>("")
    const [sponsorPayment, setSponsorPayment] = useState<string>("")
    const [userScarcityBalance, setUserScarcityBalance] = useState<string>("")
    const [sisyphusEnabled, setSisyphusEnabled] = useState<boolean>(false)
    const [actionDisabled, setActionDisabled] = useState<boolean>(false)
    const [disableReason, setDisableReason] = useState<string>("")
    const [buyScarcityProxtDialogOpen, setBuyScarcityProxtDialogOpen] = useState<boolean>(false)
    const [textWei, setTextWei] = useState<string>("")
    useEffect(() => {
        const effect = API.scarcityEffects.balanceOfEffect(walletContextProps.account)
        const subscription = effect.Observable.subscribe(bal => {
            setUserScarcityBalance(bal)
        })
        return () => { subscription.unsubscribe(); effect.cleanup() }
    })

    useEffect(() => {
        const effect = API.scarcityEffects.allowance(walletContextProps.account, walletContextProps.contracts.behodler.Sisyphus.Sisyphus.address)
        const subscription = effect.Observable.subscribe(allowance => {
            const allowanceBig = new BigNumber(API.fromWei(allowance))
            const balanceBig = new BigNumber(userScarcityBalance)
            setSisyphusEnabled(!balanceBig.isNaN() && !allowanceBig.isNaN() && allowanceBig.isGreaterThanOrEqualTo(balanceBig) && allowanceBig.isGreaterThan(0))
        })
        return () => { subscription.unsubscribe(); effect.cleanup() }
    })


    useEffect(() => {
        const effect = API.sisyphusEffects.CurrentMonarch(walletContextProps.account)
        const subscription = effect.Observable.subscribe(monarch => {
            setCurrentSisyphus(monarch)
        })
        return () => { subscription.unsubscribe(); effect.cleanup() }
    })

    useEffect(() => {
        const effect = API.sisyphusEffects.CurrentBuyout(walletContextProps.account)
        const subscription = effect.Observable.subscribe(price => {
            setCurrentCurrentBuyoutPrice(price)
        })
        return () => { subscription.unsubscribe(); effect.cleanup() }
    })

    useEffect(() => {
        const effect = API.sisyphusEffects.BuyoutAmount(walletContextProps.account)
        const subscription = effect.Observable.subscribe(price => {
            setOriginalBuyoutPrice(price)
            const bigCurrent = new BigNumber(currentBuyoutPrice)
            const bigOriginal = new BigNumber(originalBuyoutPrice)
            const difference = bigOriginal.minus(bigCurrent)

            const proportion = difference.div(originalBuyoutPrice).times(100)
            if (!proportion.isNaN()) {
                setRollBack(proportion.toString() + '%')
            }
        })
        return () => { subscription.unsubscribe(); effect.cleanup() }
    })


    useEffect(() => {
        const effect = API.sisyphusEffects.SponsorPayment(walletContextProps.account)
        const subscription = effect.Observable.subscribe(price => {
            setSponsorPayment(price)
        })
        return () => { subscription.unsubscribe(); effect.cleanup() }
    })



    const formatScarcityAmount = (v: string) => v + ' scx'
    useEffect(() => {
        const btBig = new BigNumber(buyoutText)
        let balanceTooLow: boolean = false
        if (!btBig.isNaN()) {
            const bigBalance = new BigNumber(userScarcityBalance)
            balanceTooLow = bigBalance.isLessThan(btBig)
        }
        let disabled = true
        if (btBig.isNaN()) {
            setDisableReason("")
        }
        else if (balanceTooLow) {
            setDisableReason("Scarcity balance too low.")
        } else if (btBig.isLessThan(currentBuyoutPrice)) {
            setDisableReason("Buyout value too low.")
        }
        else {
            disabled = false
            setDisableReason("")
        }
        setActionDisabled(disabled)
        setTextWei(btBig.isNaN() ? "0" : API.toWei(buyoutText))
    }, [buyoutText])

    return <Grid
        container
        direction="column"
        justify="center"
        alignItems="center"
        spacing={2}
    >
        <Grid item>
            <img width="300px" src={logo} />
        </Grid>
        <Grid item>
            <Stat label="Buyout Price" value={formatScarcityAmount(currentBuyoutPrice)} linkAction={() => setBuyoutText(new BigNumber(currentBuyoutPrice).plus(1).toString())} />
        </Grid>
        <Grid item>
            <ActionBox text={buyoutText}
                setText={setBuyoutText}
                placeHolder="Scarcity (SCX) Value"
                action={async (num: string) => await walletContextProps.contracts.behodler.Sisyphus.Sisyphus.struggle(num).send({ from: walletContextProps.account }, () => { setBuyoutText("") })}
                actionDisabled={actionDisabled}
                buttonText="Play!"
                enableText="Enable Sisyphus"
                enabled={sisyphusEnabled}
                enableAction={async () => await walletContextProps.contracts.behodler.Scarcity.approve(walletContextProps.contracts.behodler.Sisyphus.Sisyphus.address, API.UINTMAX).send({ from: walletContextProps.account })}
                balance={userScarcityBalance}
                openDialog={setBuyScarcityProxtDialogOpen}
                buyoutText={textWei}
            />
        </Grid>
        <Grid item>
            <Stat label="Current Sisyphus" small value={currentSisyphus} />
        </Grid>
        <Grid item>
            <Stat label="Original Buyout Price" value={formatScarcityAmount(originalBuyoutPrice)} small />
        </Grid>
        <Grid item>
            <Stat label="Roll back" value={rollBack} small />
        </Grid>
        <Grid item>
            <Stat label="Sponsor payment" value={formatScarcityAmount(sponsorPayment)} small />
        </Grid>
        <Grid>
            <Stat label="Your balance" value={formatScarcityAmount(userScarcityBalance)} small />
        </Grid>
        {actionDisabled ? <Grid item>
            <Typography variant="subtitle2" color="secondary">{disableReason}</Typography>
        </Grid> : ""}
        <Grid item>
            <BuyScarcityProxyDialog open={buyScarcityProxtDialogOpen} setDialogOpen={setBuyScarcityProxtDialogOpen} scarcityRequired={new BigNumber(currentBuyoutPrice)} />
        </Grid>
        <Grid item>
            <Divider />
        </Grid>
    </Grid>
}

function ActionBox(props: { text: string, placeHolder: string, setText: (v: string) => void, action: (num: string) => void, actionDisabled: boolean, buttonText: string, enabled: boolean, enableText: string, enableAction: () => void, balance: string, openDialog: (o: boolean) => void, buyoutText: string }) {
    return <Grid
        container
        direction="row"
        justify="space-around"
        alignItems="center"
        spacing={3}
    >
        <Grid item>
            <ValueTextBox text={props.text} placeholder={props.placeHolder} changeText={props.setText} entireAction={() => props.setText(props.balance)}></ValueTextBox>

        </Grid>
        <Grid>
            <Grid container
                direction="column"
                alignItems="flex-end">
                <Grid item>
                    {props.enabled ?
                        <Button onClick={() => { alert(props.buyoutText); props.action(props.buyoutText) }} disabled={props.actionDisabled} color="primary" variant="contained" >{props.buttonText}</Button>
                        :
                        <Button onClick={() => props.enableAction()} color="secondary" variant="outlined">{props.enableText}</Button>
                    }
                </Grid>
                <Grid item>
                    <Link component="button" variant="caption" color="textPrimary" onClick={() => props.openDialog(true)}>Top up Scarcity balance</Link>
                </Grid>
            </Grid>
        </Grid>
    </Grid>
}