import React from 'react';
import QueueStats from "./QueueStats"
import ActionPanel from './ActionPanel'
import HeaderStats from './HeaderStats'
import { Drawer, Grid, Hidden, makeStyles } from '@material-ui/core';
import { QueueData } from '../LPList';
interface props {
    inputToken: string
    setVisiblePosition: (p: string | null) => any
    data: QueueData
    APY:number
}

const useStyles = makeStyles({
    paper: {
        maxWidth: '750px'
    }
})

export default function QueuePosition(props: props) {
    const classes = useStyles()
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
                    <HeaderStats APY ={props.APY} inputToken={props.inputToken} eyeActive={props.data.eyeActive} eyePerSecond={props.data.eyeReward} setVisiblePosition={props.setVisiblePosition} />
                </Grid>
               
                <Grid item>
                    <ActionPanel inputToken={props.inputToken} />
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