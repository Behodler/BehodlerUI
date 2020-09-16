import * as React from 'react'
import mining from '../../../../images/behodler/liquidityMiningPlaceholder.png'
import { Grid } from '@material-ui/core'

export default function LiquidityMining() {
    return (
        <Grid
            container
            direction="column"
            justify="center"
            alignItems="center"
        >
            <Grid item>
                <img src={mining} width={400} />
            </Grid>
        </Grid>
    )

}