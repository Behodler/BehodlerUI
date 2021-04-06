import React from 'react';
import Divider from '@material-ui/core/Divider';
import QueueStats from "./QueueStats"
import ActionPanel from './ActionPanel'
import HeaderStats from './HeaderStats'
import { Drawer, Grid, Hidden, Link } from '@material-ui/core';
import { QueueData } from '../LPList';
interface props {
    inputToken: string
    setVisiblePosition: (p: string | null) => any
    data:QueueData
}

export default function QueuePosition(props: props) {
    return <div>
        <Grid
            container
            direction="column"
            justify="flex-start"
            alignItems="stretch"
            spacing={10}
        >
            <Grid item>
                <HeaderStats inputToken={props.inputToken} eyeActive={props.data.eyeActive} eyePerSecond={props.data.eyeReward} />
            </Grid>
            <Grid item>
                <Link onClick={() => props.setVisiblePosition(null)}>back to token selection</Link>
            </Grid>
            <Grid item>
                <Divider />
            </Grid>
            <Grid item>
                <ActionPanel />
            </Grid>
        </Grid>
        <Hidden mdDown>
            <Drawer open={true} variant="persistent"
                anchor="right">
                <QueueStats />
            </Drawer>
        </Hidden>
    </div>
}