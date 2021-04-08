import React, { useState, useEffect } from 'react';
import QueueStats from "./QueueStats"
import ActionPanel from './ActionPanel'
import HeaderStats from './HeaderStats'
import { Drawer, Grid, Hidden, makeStyles } from '@material-ui/core';
import { QueueData } from '../LPList';
import { LiquidQueueBatch } from '../../../../../blockchain/observables/LiquidQueueEffects'
import API from '../../../../../blockchain/ethereumAPI'

interface props {
    inputToken: string
    setVisiblePosition: (p: string | null) => any
    data: QueueData
    APY: number
}

const useStyles = makeStyles({
    paper: {
        maxWidth: '750px'
    }
})

export default function QueuePosition(props: props) {
    const classes = useStyles()
    const [tokenSymbol, setTokenSymbol] = useState<string>('')
    const [maxInputToken, setMaxInputToken] = useState<string>('')
    const [rewardToken, setRewardToken] = useState<string>('')
    const [batches, setBatches] = useState<LiquidQueueBatch[]>([])

    useEffect(() => {
        const effect = API.liquidQueueEffects.batches()
        const subscription = effect.Observable.subscribe(list => {
            setBatches(list)
            if (list.length > 300)
                console.log(JSON.stringify(batches))
        })

        return () => { effect.cleanup(); subscription.unsubscribe() }
    }, [])

    return (
        <div>
            <Grid
                container
                direction="column"
                justify="flex-start"
                alignItems="stretch"
                spacing={10}
                className={classes.paper}
            >
                <Grid item>
                    <HeaderStats APY={props.APY} inputToken={props.inputToken}
                        eyeActive={props.data.eyeActive}
                        eyePerSecond={props.data.eyeReward}
                        setVisiblePosition={props.setVisiblePosition}
                        tokenSymbol={tokenSymbol}
                        setTokenSymbol={setTokenSymbol}
                        maxInputToken={maxInputToken}
                        setMaxInputToken={setMaxInputToken}
                        rewardToken={rewardToken}
                        setRewardToken={setRewardToken}
                    />
                </Grid>

                <Grid item>
                    <ActionPanel inputToken={props.inputToken} tokenSymbol={tokenSymbol} maxInputToken={maxInputToken} rewardToken={rewardToken} />
                </Grid>
            </Grid>
            <Hidden mdDown>
                <Drawer open={true} variant="persistent"
                    anchor="right">
                    <QueueStats />
                </Drawer>
            </Hidden>
        </div>
    )
}