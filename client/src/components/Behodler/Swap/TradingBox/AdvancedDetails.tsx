import * as React from 'react'
import {
    Grid,
    Typography,
    Paper,
    makeStyles,
} from '@material-ui/core';
import API from '../../../../blockchain/ethereumAPI'
import BigNumber from 'bignumber.js';
import { ValueTextBox } from '../../../Common/ValueTextBox'

export enum configuration {
    SCARCITYIN,
    SCARCITYOUT,
    TOKENTOTOKEN
}

interface props {
    setMinPrice: (min: string) => void
    setMaxPrice: (min: string) => void
    minPrice: string
    maxPrice: string
    nameOfInput: string
    nameOfOutput: string
    inputValue: string
    outputValue: string
    DryRunSCX: string
    DryRunTokens: string,
    configuration: configuration
}

/*
 Wording: "You are selling 10 oxt which will cause the behodler token bonding curve to produce 10 scarcity (scx) <remember fees>. This will then be used to purchase 50 Loom."
    You can set bounds on how much scarcity is produced or required to limit your losses from front running or late block inclusion:
    Min scx required to produce 10 oxt  <text box>
    Max scx required to purchase 50 Loom <text box>
     */
const useStyles = makeStyles((theme) => ({
    root: {
        padding: '2px 4px',
        display: 'flex',
        alignItems: 'center',
        width: 800,
        backgroundColor: "rgb(32, 33, 36)"
    }, typography: {
        padding: '0 5px 0 5px',
        color: "#BCBBBC"
    }
}));


export default function AdvancedDetails(props: props) {
    const classes = useStyles();
    let dryRunSCX = props.DryRunSCX
    try {
        dryRunSCX = API.fromWei(new BigNumber(dryRunSCX).toString())
    }
    catch (err) {
        dryRunSCX = props.DryRunSCX
    }

    let dryRunTokens = props.DryRunTokens
    try {
        dryRunTokens = API.fromWei(new BigNumber(props.DryRunTokens).toString())
    } catch (err) {
        dryRunTokens = props.DryRunTokens
    }

    let message = `You are selling ${props.inputValue} `
    if (props.configuration === configuration.SCARCITYIN) {
        message += `Scarcity (SCX) to the Behodler token bonding curve which will release ${props.outputValue} ${props.nameOfOutput}, yielding a price of ${new BigNumber(props.inputValue).dividedBy(new BigNumber(props.outputValue))} Scarcity (SCX) per ${props.nameOfOutput}. You can set a maximum price you're willing to pay in Scarcity for ${props.nameOfOutput}.`
    }
    else if (props.configuration === configuration.SCARCITYOUT) {
        message += `${props.nameOfInput} to the Behodler token bonding curve which will mint ${props.outputValue} Scarcity (SCX), yielding a price of ${new BigNumber(props.inputValue).dividedBy(new BigNumber(props.outputValue))} ${props.nameOfOutput} per Scarcity (SCX). You can set the minimum price in Scarcity you're willing to accept for ${props.nameOfInput}.`
    } else {
        message += `${props.nameOfInput} to the Behodler token bonding curve which will mint ${dryRunSCX} Scarcity (SCX), yielding a price of ${new BigNumber(dryRunSCX).dividedBy(new BigNumber(props.inputValue))} Scarcity per ${props.nameOfInput}. This will then be used to purchase ${dryRunTokens} ${props.nameOfOutput} from the bonding curve, burning the scarcity in the process, yielding a price of ${new BigNumber(props.outputValue).dividedBy(new BigNumber(dryRunSCX))} ${props.nameOfOutput} per scarcity. You can set the minimum price in Scarcity you're willing to accept for ${props.nameOfInput} as well as the maximum price in Scarcity you're willing to pay for ${props.nameOfOutput}`
    }

    return <Paper className={classes.root}>
        <Grid
            container
            direction="column"
            justify="center"
            alignItems="center"
            spacing={2}
        >
            <Grid item>
                <Typography className={classes.typography} variant="subtitle2">{message}</Typography>
            </Grid>

            <Grid item>
                <Grid
                    container
                    direction="row"
                    justify="space-around"
                    alignItems="center"
                >
                    {props.configuration === configuration.SCARCITYOUT || props.configuration === configuration.TOKENTOTOKEN ?
                        <Grid item>
                            <ValueTextBox placeholder="Min Price" changeText={props.setMinPrice} text={props.minPrice} />
                        </Grid> : ""}
                    {props.configuration === configuration.SCARCITYIN || props.configuration === configuration.TOKENTOTOKEN ?
                        <Grid item>
                            <ValueTextBox placeholder="Max Price" changeText={props.setMaxPrice} text={props.maxPrice} />
                        </Grid> : ""}
                </Grid>
            </Grid>
        </Grid>
    </Paper>
}