import { Grid, Theme } from '@material-ui/core'
import { makeStyles } from '@material-ui/styles'
import * as React from 'react'

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        borderRadius: 5,
        width: 300,
        position: "absolute",
        bottom:52,
        left: -87,
        zIndex: 1,
        border: "1px solid white",
        backgroundColor: "rgba(27, 22, 64,0.75)",
        padding: 15,
        fontSize: 15
        // '&:hover': {
        //     display: "block"
        // }
    },
    rootMobile: {
        borderRadius: 5,
        width: 300,
        position: "absolute",
        bottom: 55,
        left: 225,
        border: "1px solid white",
        backgroundColor: "rgba(27, 22, 64,0.75)",
        padding: 15,
        fontSize: 15
    },
    left: {
        color: "lightgrey",
    },
    right: {
        color: "white",
        fontWeight: "bold",
    }
}))

export enum InputType {
    burnable,
    pyro,
    scx
}

interface props {
    inputType: InputType
    burnFee: string
    priceImpact: string
    inputTokenName: string
    outputTokenName: string
    inputReserve: string
    outputReserve: string
    mobile: boolean
}
export default function MoreInfo(props: props) {
    const classes = useStyles()
    return <div className={props.mobile ? classes.rootMobile : classes.root}>
        <Grid
            container
            direction="column"
            justify="space-between"
            alignItems="stretch"
            spacing={1}
        >
            {props.inputType === InputType.scx ? "" : <Grid item>
                <Row label={props.inputType === InputType.pyro ? "Pyrotoken fee" : "Burn fee"}>
                    {props.burnFee} {props.inputTokenName}
                </Row>
            </Grid>}
            <Grid item>
                <Row label="Price impact">
                    {props.priceImpact}
                </Row>
            </Grid>
            <Grid item>
                <Row label="Route">
                    {`${props.inputTokenName} > ${props.outputTokenName}`}
                </Row>
            </Grid>
            {props.inputReserve.length > 0 ? <Grid item>
                <Row label={`${props.inputTokenName} in reserve`}>
                    {props.inputReserve}
                </Row>
            </Grid> : ""}

            {props.outputReserve.length > 0 ? <Grid item>
                <Row label={`${props.outputTokenName} in reserve`}>
                    {props.outputReserve}
                </Row>
            </Grid> : ""}
        </Grid>
    </div>
}

function Row(props: { label: string, children: any }) {
    const classes = useStyles()

    return <Grid
        container
        direction="row"
        justify="space-between"
        alignItems="center"
    >
        <Grid item className={classes.left}>
            {props.label}
        </Grid>
        <Grid item className={classes.right}>
            {props.children}
        </Grid>
    </Grid>
}