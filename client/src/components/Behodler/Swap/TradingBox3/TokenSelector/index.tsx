import { Grid, makeStyles, Theme } from '@material-ui/core'
import * as React from 'react'
import { Images } from '../ImageLoader'

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        // bo
    },
    outerCircle: {
        /* Vector */
        alignContent: "center",
        alignItems: "center",
        width: 140,
        height: 140,
        borderRadius: "50%",
        background: "rgba(54,12,87,0.9)"
        //  /rgba(47, 48, 59, 0.255)
        // background: "linear-gradient(72.04deg, rgba(23, 23, 20, 0) 7.74%, rgba(47, 48, 59, 0.255) 84.79%)"
    },
    innerCircle: {
        display: "flex",
        alignItems: 'center',
        margin: "0 auto"
    }
}))

interface props {
token:number
}
export default function TokenSelector(props: props) {
    const classes = useStyles()
    return <div className={classes.root}>
        <Grid
            className={classes.outerCircle}
            container
            direction="row"
            justify="center"
            alignItems="center"
        >
            <Grid item>
                <div className={classes.innerCircle}>
                    <img alt="token" src={Images[props.token]} width="70" />
                </div>
            </Grid>

        </Grid>

    </div>
}