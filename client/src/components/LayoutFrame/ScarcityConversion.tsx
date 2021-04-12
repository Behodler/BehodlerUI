import { Dialog, Grid, Typography, Button, makeStyles, createStyles, DialogContent, Container } from "@material-ui/core";
import React, { useCallback, useContext, useEffect, useState } from "react";
import { formatSignificantDecimalPlaces } from "src/util/jsHelpers";
import API from '../../blockchain/ethereumAPI'
import { WalletContext } from "../Contexts/WalletStatusContext";

const useStyle = makeStyles(theme => createStyles({
    grid: {
        // margin: 10
        margin: 0,
        //    background: "linear-gradient(to bottom left, #9DC8F2, white)",
    },
    dialog: {
        // padding: 50

    },
    dialogContent: {
        background: 'radial-gradient(circle, rgba(255,255,255,1) 61%, rgba(255,216,227,1) 100%);',
        color: '#445555'
    },
    skip: {
        fontWeight: 'bold'
    }, boldDiv: {
        fontWeight: 'bold',
        display: 'inline-block',
        color: '#b35d5d'
    },
    LinkColumn: {
        marginLeft: -60
    }
}))

const BoldDiv = function (props: { noFormat?: boolean, children?: any }) {
    const classes = useStyle()
    return <span className={classes.boldDiv}>
        {props.noFormat ? props.children : formatSignificantDecimalPlaces(props.children)}
    </span>
}

const hideStorageItemForDay = 'scxConvertHide'
const hideStorageItemFor5Minutes = 'scxConverHide5'
enum Visibility {
    Loading,
    Open,
    Closed,
    HideForDay,
    HiddenForDay,
    HideFor5Minutes,
    HiddenFor5Minutes
}
const DAY = 216000000 //8640000 = 1 day
const FiveMins = 6000000
export default function ScarcityConversion(props: {}) {
    const classes = useStyle()
    const walletContextProps = useContext(WalletContext)

    const [dialogVisibility, setDialogVisibility] = useState<Visibility>(Visibility.Loading)
    const [scxBalance, setSCXBalance] = useState<string>('0')
    const [exchangeRate, setExchangeRate] = useState<string>('0')
    const [expectedNewScarcity, setExpectedNewScarcity] = useState<string>('0')
    const [migrationClicked, setMigrationClicked] = useState<boolean>(false)

    const scarcityEffects = API.generateNewEffects(walletContextProps.contracts.behodler.Scarcity.address, walletContextProps.account, false)

    useEffect(() => {
        if (dialogVisibility === Visibility.Loading) {
            const lastHide = localStorage.getItem(hideStorageItemForDay)
            const fiveminuteHide = localStorage.getItem(hideStorageItemFor5Minutes)
            if (lastHide) {
                const duration = parseInt(lastHide)
                const elapsed = new Date().getTime() - duration

                if (elapsed > DAY) {
                    localStorage.removeItem(hideStorageItemForDay)
                    if (scxBalance !== '0') {
                        setDialogVisibility(Visibility.Open)
                    }
                }
            } else if (fiveminuteHide) {
                const duration = parseInt(fiveminuteHide)
                const elapsed = new Date().getTime() - duration

                if (elapsed > FiveMins) {
                    localStorage.removeItem(hideStorageItemFor5Minutes)
                    if (scxBalance !== '0') {
                        setDialogVisibility(Visibility.Open)
                    }
                }
            }
            else if (scxBalance !== '0') {
                setDialogVisibility(Visibility.Open)
            }
        } else if (dialogVisibility === Visibility.HideForDay) {
            localStorage.setItem(hideStorageItemForDay, new Date().getTime().toString())
            setDialogVisibility(Visibility.HiddenForDay)
        }
        else if (dialogVisibility === Visibility.HideFor5Minutes) {
            localStorage.setItem(hideStorageItemFor5Minutes, new Date().getTime().toString())
            setDialogVisibility(Visibility.HiddenFor5Minutes)
        }
        else if (dialogVisibility === Visibility.HiddenForDay) {
            const lastHide = localStorage.getItem(hideStorageItemForDay)
            if (lastHide) {
                const duration = parseInt(lastHide)
                const elapsed = new Date().getTime() - duration
                if (elapsed > DAY) {
                    localStorage.removeItem(hideStorageItemForDay)
                    if (scxBalance !== '0') {
                        setDialogVisibility(Visibility.Open)
                    }
                }
            }
        }
        else if (dialogVisibility === Visibility.HiddenFor5Minutes) {
            const lastHide = localStorage.getItem(hideStorageItemFor5Minutes)
            if (lastHide) {
                const duration = parseInt(lastHide)
                const elapsed = new Date().getTime() - duration
                if (elapsed > FiveMins) {
                    localStorage.removeItem(hideStorageItemFor5Minutes)
                    if (scxBalance !== '0') {
                        setDialogVisibility(Visibility.Open)
                    }
                }
            }
        }
        else {
            localStorage.removeItem(hideStorageItemForDay)
            localStorage.removeItem(hideStorageItemFor5Minutes)
        }
    })

    useEffect(() => {
        const scxEffect = scarcityEffects.balanceOfEffect(walletContextProps.account)
        const scxSubscription = scxEffect.Observable.subscribe(balance => {
            if (balance != scxBalance)
                setDialogVisibility(Visibility.Loading)
            setSCXBalance(balance)
        })

        const bridgeEffect = API.bridgeEffects.exchangeRate()
        const bridgeSub = bridgeEffect.Observable.subscribe(ex => {
            setExchangeRate(API.pureHexToNumberString(ex))
        })

        return () => { scxSubscription.unsubscribe();  bridgeSub.unsubscribe(); }
    })

    useEffect(() => {
        const bigSCX = BigInt(API.toWei(scxBalance))
        const bigEx = BigInt(exchangeRate == 'unset' ? '0' : exchangeRate)
        if (bigEx > 0)
            setExpectedNewScarcity((bigSCX / bigEx).toString())
    }, [scxBalance, exchangeRate])

    const migrationClickCallback = useCallback(async () => {
        if (migrationClicked) {
            await walletContextProps.contracts.behodler.Scarcity.approve(walletContextProps.contracts.behodler.Behodler2.Morgoth.ScarcityBridge.address, API.UINTMAX).send({ from: walletContextProps.account }, () => {
                walletContextProps.contracts.behodler.Behodler2.Morgoth.ScarcityBridge.swap().send({ from: walletContextProps.account })
            })
            setMigrationClicked(false)
        }
    }, [migrationClicked])

    useEffect(() => {
        migrationClickCallback()
    }, [migrationClicked])


    const ethNewSCX =  parseFloat(expectedNewScarcity) / parseFloat("1000000000000000000")
    return <Dialog fullWidth={true} open={dialogVisibility === Visibility.Open} onClose={() => setDialogVisibility(Visibility.HideFor5Minutes)} className={classes.dialog}>
        <DialogContent className={classes.dialogContent}>
            <Grid
                className={classes.grid} container spacing={2}
                direction="column"
                justify="center"
                alignItems="stretch">
                <Grid item><Typography variant="h4"> Scarcity (SCX) 2 Token Swap</Typography></Grid>
                <Grid item>
                    <Typography variant="h6">Welcome to Behodler 2, the successor to Behodler 1!</Typography>
                </Grid>
                <Grid item>
                    <Typography variant="body1">Behodler 2 is powered by <BoldDiv noFormat>Scarcity (SCX) 2</BoldDiv> and no longer supports <BoldDiv noFormat>Scarcity (SCX) 1</BoldDiv>.</Typography>
                </Grid>
                <Grid item>
                    <Typography variant="body1">We've deployed a token swap contract to migrate your <BoldDiv noFormat>SCX 1</BoldDiv> to <BoldDiv noFormat>SCX 2</BoldDiv> at a fixed exchange rate.
                    </Typography>
                </Grid>
                <Grid item>
                    <Typography variant="body2">The token swap ratio between <BoldDiv noFormat>SCX 1</BoldDiv> and <BoldDiv noFormat>SCX 2</BoldDiv> is: <BoldDiv noFormat>[{exchangeRate}:1].</BoldDiv> </Typography>
                </Grid>
                <Grid item>
                    <Typography variant="body2">You currently own <BoldDiv>{scxBalance}</BoldDiv><BoldDiv noFormat>&nbsp;SCX 1</BoldDiv> tokens which can be swapped for <BoldDiv>{ethNewSCX}</BoldDiv><BoldDiv noFormat>&nbsp;SCX 2</BoldDiv> tokens.</Typography>
                </Grid>
                <Grid item>
                    <Grid container
                        direction="row"
                        spacing={4}
                        alignItems="center"
                        justify="center">
                        <Grid item>
                            <Button variant="contained" color="primary" onClick={() => setMigrationClicked(true)}>Swap SCX 1 for SCX 2</Button>
                        </Grid>
                        <Grid item>
                            <Button onClick={() => setDialogVisibility(Visibility.HideForDay)} variant="contained" color="secondary" className={classes.skip}>
                                Sleep reminder for 1 week
                         </Button>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item>
                    <Container >
                        <Grid container direction="row" alignItems="center" justify="center" spacing={4}>
                            <Grid item className={classes.LinkColumn}>
                                <a href="https://medium.com/weidaithriftcoin/a-few-points-on-the-upcoming-scarcity-migration-d1a479fd0695" target="_blank">Learn more</a>
                            </Grid>
                        </Grid>
                    </Container>
                </Grid>
            </Grid>
        </DialogContent>
    </Dialog>
}
