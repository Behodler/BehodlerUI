import { UIContainerContextProps } from '@behodler/sdk/dist/types'
import { Grid, Link, makeStyles, Theme } from '@material-ui/core'
import * as React from 'react'
import { useEffect } from 'react'
import API from 'src/blockchain/ethereumAPI'
import { ContainerContext } from 'src/components/Contexts/UIContainerContextDev'
import { WalletContext } from 'src/components/Contexts/WalletStatusContext'
import { StyledInput as InputBox } from './StyledInput'
// import { WalletContext } from 'src/components/Contexts/WalletStatusContext'
// import { useEffect, useCallback, useState, useContext } from 'react'
// import { Button, IconButton, Box, makeStyles, Theme } from '@material-ui/core'
const scaler = (scale) => num => Math.floor(num * scale)
const scale = scaler(0.9)
const useStyles = makeStyles((theme: Theme) => ({
    root: {
        width: scale(310),
    },
    mobileRoot: {
        width: scale(400),
        background: "#360C57",
        borderRadius: 10,
        padding: 10
    },
    Direction: {

        // height: 17,
        fontFamily: "Gilroy-medium",
        fontStyle: "normal",
        fontWeight: 600,
        fontSize: scale(16),
        // lineHeight: 17,
        /* identical to box height */
        color: "darkGrey",
        textAlign: "center",
        verticalAlign: " middle",
    },
    BalanceContainer: {

    },
    BalanceLabel: {
        height: scale(19),

        fontFamily: "Gilroy-medium",
        fontStyle: "normal",
        fontWeight: 600,
        fontSize: scale(16),
        /* identical to box height */

        color: "darkGrey"
    },
    BalanceValue: {

        height: scale(19),

        fontFamily: "Gilroy-medium",
        fontStyle: "normal",
        fontWeight: 600,
        fontSize: scale(16),
        color: "white"
    },
    Max: {
        /* (MAX) */

        height: scale(19),

        fontFamily: "Gilroy-medium",
        fontStyle: "normal",
        fontWeight: 600,
        fontSize: scale(16),
        /* identical to box height */

        color: "#80C2FF",
        cursor: 'pointer'

    },
    PaddedGridItem: {
        marginRight: '5px',
        padding: 0
    },
    estimate: {
        height: scale(19),

        fontFamily: "Gilroy-medium",
        fontStyle: "normal",
        fontWeight: 600,
        fontSize: scale(16),
        color: "white"
    },
    dollarSign: {
        color: "grey",
        marginRight: 5,
        display:"inline"
    }
}))

interface Hook<T> {
    set: (v: T) => void
    value: T
}

export interface tokenProps {
    address: string
    value: Hook<string>
    balance: string
    estimate: string
    valid: Hook<boolean>
    approved?: Hook<boolean>
    name: string
}

interface props {
    isEth: boolean
    isSCX: boolean
    direction: 'FROM' | 'TO',
    token: tokenProps,
    mobile?: boolean,
    inputKey: string
    focus: boolean
    setFocus: () => void
}


export default function NewField(props: props) {
    const classes = useStyles()
    const uiContainerContextProps = React.useContext<UIContainerContextProps>(ContainerContext)
    const walletContextProps = React.useContext(WalletContext);
    const behodlerAddress = walletContextProps.contracts.behodler.Behodler2.Behodler2.address
    // const walletContextProps = React.useContext(WalletContext);
    const account = uiContainerContextProps.walletContext.account || '0x0'
    const BorderedGridItem = (props: { children: any }) => <Grid item >{props.children}</Grid>
    const currentTokenEffects = API.generateNewEffects(props.token.address, account, props.isEth)

    useEffect(() => {
        if (props.direction === 'TO')
            return
        if (props.isEth || props.isSCX) {
            props.token.approved?.set(true)
            return
        }

        const effect = currentTokenEffects.allowance(account, behodlerAddress)
        const subscription = effect.Observable.subscribe((allowance) => {
            const scaledAllowance = API.fromWei(allowance)
            const allowanceFloat = parseFloat(scaledAllowance)
            const balanceFloat = parseFloat(props.token.balance)
            const en = !(isNaN(allowanceFloat) || isNaN(balanceFloat) || allowanceFloat < balanceFloat)
            props.token.approved?.set(en)
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [props.token.address])

    return <Grid
        container
        direction="column"
        justify="flex-start"
        alignItems="stretch"
        spacing={2}
        className={props.mobile ? classes.mobileRoot : classes.root}
    >
        {props.mobile ? "" : <BorderedGridItem>
            <DirectionLabel direction={props.direction} />
        </BorderedGridItem>}

        {props.mobile ?
            <BorderedGridItem>
                <Grid container direction="row" spacing={2} justify="space-between" alignItems="center"><Grid item><DirectionLabel direction={props.direction} /></Grid><Grid item>
                    <InputBox setFocus={props.setFocus} focus={props.focus} mobile token={props.token} /></Grid></Grid>
            </BorderedGridItem>
            :
            <BorderedGridItem>
                <InputBox focus={props.focus} setFocus={props.setFocus} token={props.token} />
            </BorderedGridItem>
        }

        <BorderedGridItem>
            <BalanceContainer setValue={props.token.value.set} balance={props.token.balance.toString()} token={props.token.address} estimate={props.token.estimate} />
        </BorderedGridItem>
    </Grid>
}

function DirectionLabel(props: { direction: string }) {
    const classes = useStyles()
    return <div className={classes.Direction}>
        {props.direction}
    </div>
}


function BalanceContainer(props: { estimate: string, balance: string, token: string, setValue: (v: string) => void }) {
    const classes = useStyles()
    return <Grid
        container
        direction="row"
        justify="space-between"
        alignItems="center"
        spacing={1}
        className={classes.BalanceContainer}
    >
        <Grid item>
            <Balance setValue={props.setValue} balance={props.balance} token={props.token} />
        </Grid>
        <Grid item>
            <Estimate estimate={props.estimate} />
        </Grid>
    </Grid>
}

const PaddedGridItem = (props: { children?: any }) => {
    const classes = useStyles()
    return <Grid item className={classes.PaddedGridItem}>
        {props.children}
    </Grid>
}
function Balance(props: { token: string, balance: string, setValue: (v: string) => void }) {
    const classes = useStyles()
    return <Grid
        container
        direction="row"
        justify="flex-start"
        alignItems="center"

    >
        <PaddedGridItem  ><div className={classes.BalanceLabel}>Balance</div></PaddedGridItem>
        <PaddedGridItem ><div className={classes.BalanceValue}>{props.balance}</div></PaddedGridItem>
        <PaddedGridItem ><Link onClick={() => props.setValue(props.balance)} className={classes.Max}>(MAX)</Link></PaddedGridItem>
    </Grid>
}

function Estimate(props: { estimate: string }) {
    const classes = useStyles()
    return <div className={classes.estimate}><div className={classes.dollarSign}>~$</div>{props.estimate}</div>
}

