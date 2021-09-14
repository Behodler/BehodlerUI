import { Grid, Link, makeStyles, Theme } from '@material-ui/core'
import * as React from 'react'
import { formatNumberText, isNullOrWhiteSpace } from 'src/util/jsHelpers'
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
        borderRadius:10,
        padding:10
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
    inputWide: {
        /* Vector */
        width: scale(300),
        height: scale(57),
        background: "#360C57",
        border: "1px solid rgba(70, 57, 130, 0.5)",
        boxSizing: "border-box",
        /* 2.00073731114506 */

        fontFamily: "Gilroy-medium",
        fontStyle: "normal",
        fontWeight: 500,
        fontSize: scale(24),
        padding: "10px 20px 10px 20px",
        color: "#FFFFFF",
        outline: 0,
        borderRadius: 5,
    },
    inputNarrow: {
        width: scale(270),
        background: "transparent",
        border: "none",
        /* 2.00073731114506 */

        fontFamily: "Gilroy-medium",
        fontStyle: "normal",
        fontWeight: 500,
        fontSize: scale(20),
        color: "#FFFFFF",
        outline: 0
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
}))

interface Hook<T>{
    set: (v:T)=>void
    value:T
}

export interface tokenProps{
    address:string
    value:Hook<string>
    balance:BigInt
    estimate:string
    valid:Hook<boolean>
}

interface props {
    direction: string,
    token: tokenProps,
    mobile?: boolean,
}

export default function NewField(props: props) {
    const classes = useStyles()
    const bigOrderOfMagnitude = "1000000000000000000"
    // const walletContextProps = React.useContext(WalletContext);

    const BorderedGridItem = (props: { children: any }) => <Grid item >{props.children}</Grid>
    
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
                <Grid container direction="row" spacing={2} justify="space-between" alignItems="center"><Grid item><DirectionLabel direction={props.direction} /></Grid><Grid item><InputBox bigOrderOfMagnitude={bigOrderOfMagnitude} mobile token={props.token} /></Grid></Grid>
            </BorderedGridItem>
            :
            <BorderedGridItem>
                <InputBox bigOrderOfMagnitude={bigOrderOfMagnitude} token = {props.token} />
            </BorderedGridItem>
        }

        <BorderedGridItem>
            <BalanceContainer  balance={props.token.balance.toString()} token={props.token.address} estimate={props.token.estimate} />
        </BorderedGridItem>
    </Grid>
}

function DirectionLabel(props: { direction: string }) {
    const classes = useStyles()
    return <div className={classes.Direction}>
        {props.direction}
    </div>
}

function InputBox(props: { mobile?: boolean, token:tokenProps, bigOrderOfMagnitude:string }) {
    const classes = useStyles()


    const setFormattedInput = (value: string) => {
        if (isNullOrWhiteSpace(value)) {
            props.token.value.set('')
            props.token.valid.set(true)
        }
        else {
        const formattedText = formatNumberText(value)
        props.token.value.set(value)
        const parsedValue = parseFloat(formattedText)
        const comparisonNumber = !isNaN(parsedValue)?  BigInt(props.token.value.value)*BigInt(props.bigOrderOfMagnitude):BigInt(0)
        const isValid = comparisonNumber<props.token.balance
        props.token.valid.set(isValid)
    }}

    return <div><input value={props.token.value.value} onChange={(event)=>setFormattedInput(event.target.value)} className={props.mobile ? classes.inputNarrow : classes.inputWide} /></div>
}

function BalanceContainer(props: { estimate: string, balance: string, token: string }) {
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
            <Balance balance={props.balance} token={props.token} />
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
function Balance(props: { token: string, balance: string }) {
    const classes = useStyles()
    return <Grid
        container
        direction="row"
        justify="flex-start"
        alignItems="center"

    >
        <PaddedGridItem  ><div className={classes.BalanceLabel}>Balance</div></PaddedGridItem>
        <PaddedGridItem ><div className={classes.BalanceValue}>{props.balance} {props.token}</div></PaddedGridItem>
        <PaddedGridItem ><Link className={classes.Max}>(MAX)</Link></PaddedGridItem>
    </Grid>
}

function Estimate(props: { estimate: string }) {
    const classes = useStyles()
    return <div className={classes.estimate}>${props.estimate}</div>
}

