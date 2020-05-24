
import * as React from 'react'
import { Typography, Grid } from '@material-ui/core'

export default function Stat(props: {
    label: string, value: string, small?: boolean}) {
    return <Grid
        container
        direction="row"
        justify="space-around"
        alignItems="center"
        spacing={3}
    >
        <Grid item>
            <Typography variant={props.small ? "caption" : "h6"} >
                {props.label}
            </Typography>
        </Grid>
        <Grid>
            <Typography variant={props.small ? "caption" : "h6"}>
                {props.value}
            </Typography>
        </Grid>
    </Grid>
}