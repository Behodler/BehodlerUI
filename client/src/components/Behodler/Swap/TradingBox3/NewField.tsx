import { Grid, Link, makeStyles, Theme } from '@material-ui/core'
import * as React from 'react'
// import { useEffect, useCallback, useState, useContext } from 'react'
// import { Button, IconButton, Box, makeStyles, Theme } from '@material-ui/core'

interface props {
    direction: string,
    estimate: string,
    balance: string,
    token: string
}

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        width: 278
    },
    Direction: {

        // height: 17,
        fontFamily: "Gilroy-medium",
        fontStyle: "normal",
        fontWeight: 600,
        fontSize: 14,
        // lineHeight: 17,
        /* identical to box height */
        color: "darkGrey",
        textAlign: "center",
        verticalAlign: " middle",
    },
    input: {
        /* Vector */
        width: 278,
        height: 57,
        background: "#3B2F53",
        border: "1px solid rgba(70, 57, 130, 0.5)",
        boxSizing: "border-box",
        /* 2.00073731114506 */

        fontFamily: "Gilroy-medium",
        fontStyle: "normal",
        fontWeight: 500,
        fontSize: 24,
        padding: "10px 20px 10px 20px",
        color: "#FFFFFF",
        borderRadius: 10


    },
    BalanceContainer: {

    },
    BalanceLabel: {
        /* Balance: 2.1 ETH */


        height: 19,

        fontFamily: "Gilroy-medium",
        fontStyle: "normal",
        fontWeight: 600,
        fontSize: 16,
        /* identical to box height */

        color: "darkGrey"
    },
    BalanceValue: {

        height: 19,

        fontFamily: "Gilroy-medium",
        fontStyle: "normal",
        fontWeight: 600,
        fontSize: 16,
        color: "white"
    },
    Max: {
        /* (MAX) */

        height: 19,

        fontFamily: "Gilroy-medium",
        fontStyle: "normal",
        fontWeight: 600,
        fontSize: 16,
        /* identical to box height */

        color: "#80C2FF",
        cursor: 'pointer'

    },
    PaddedGridItem: {
        marginRight: '5px',
        padding: 0
    },
    estimate: {
        height: 19,

        fontFamily: "Gilroy-medium",
        fontStyle: "normal",
        fontWeight: 600,
        fontSize: 16,
        color: "white"
    }
}))


export default function NewField(props: props) {
    const classes = useStyles()
    return <Grid
        container
        direction="column"
        justify="center"
        alignItems="stretch"
        spacing={2}
        className={classes.root}
    >
        <Grid item>
            <DirectionLabel direction={props.direction} />
        </Grid>
        <Grid item>
            <InputBox />
        </Grid>
        <Grid item>
            <BalanceContainer balance={props.balance} token={props.token} estimate={props.estimate} />
        </Grid>
    </Grid>
}

function DirectionLabel(props: { direction: string }) {
    const classes = useStyles()
    return <div className={classes.Direction}>
        {props.direction}
    </div>
}

function InputBox() {
    const classes = useStyles()
    return <div><input className={classes.input} /></div>
}

function BalanceContainer(props: { estimate: string, balance: string, token: string }) {
    const classes = useStyles()
    return <Grid
        container
        direction="row"
        justify="space-around"
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

