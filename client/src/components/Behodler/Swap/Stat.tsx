
import * as React from 'react'
import { Typography, Grid, Link, makeStyles } from '@material-ui/core'
import lightBlue from '@material-ui/core/colors/lightBlue'

const useStyles = makeStyles({
    link: {
        color: lightBlue['A700']
    }
})

export default function Stat(props: {
    label: string, value: string, linkAction?: () => void, small?: boolean
}) {
    const classes = useStyles()
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
            {props.linkAction ? <Link component="button" onClick={props.linkAction} className={classes.link}>  <Typography variant={props.small ? "caption" : "h6"}>
                {props.value}
            </Typography></Link> : <Typography variant={props.small ? "caption" : "h6"}>
                    {props.value}
                </Typography>}
        </Grid>
    </Grid>
}