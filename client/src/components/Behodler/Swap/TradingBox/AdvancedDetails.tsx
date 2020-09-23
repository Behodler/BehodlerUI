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

const useStyles = makeStyles((theme) => ({
    advancedDetailsRoot: {
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

    const minPrice = new BigNumber(dryRunSCX).dividedBy(new BigNumber(props.inputValue))
    const maxPrice = new BigNumber(dryRunSCX).dividedBy(new BigNumber(props.outputValue))

    let message = `You are selling ${props.inputValue} `
    if (props.configuration === configuration.SCARCITYIN) {
        message += `Scarcity (SCX) to the Behodler token bonding curve which will release ${props.outputValue} ${props.nameOfOutput}, yielding a price of ${maxPrice} Scarcity (SCX) per ${props.nameOfOutput}. You can set a maximum price you're willing to pay in Scarcity for ${props.nameOfOutput}.`
    }
    else if (props.configuration === configuration.SCARCITYOUT) {
        message += `${props.nameOfInput} to the Behodler token bonding curve which will mint ${props.outputValue} Scarcity (SCX), yielding a price of ${minPrice} Scarcity (SCX) per ${props.nameOfOutput} . You can set the minimum price in Scarcity you're willing to accept for ${props.nameOfInput}.`
    } else {
        message += `${props.nameOfInput} to the Behodler token bonding curve which will mint ${dryRunSCX} Scarcity (SCX), yielding a price of ${minPrice} Scarcity per ${props.nameOfInput}. This will then be used to purchase ${dryRunTokens} ${props.nameOfOutput} from the bonding curve, burning the scarcity in the process, yielding a price of ${maxPrice} Scarcity per ${props.nameOfOutput}. You can set the minimum price in Scarcity you're willing to accept for ${props.nameOfInput} as well as the maximum price in Scarcity you're willing to pay for ${props.nameOfOutput}`
    }

    return <Paper className={classes.advancedDetailsRoot}>
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