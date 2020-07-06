import * as React from 'react'
import { useState } from 'react'
import { Grid, Button } from '@material-ui/core'
import Header from "./Header"
import InfoSlider from "./InfoSlider"
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
    root: {
        marginTop: "25px"
    }
})

interface scarcityLandingPageProps {
}

export default function ScarcityLandingPage(props: scarcityLandingPageProps) {
    const [explainerSlideIndex, setExplainerSlideIndex] = useState<number>(0)
    const classes = useStyles();
    return <Grid
        container
        direction="column"
        justify="center"
        alignItems="stretch"
        spacing={4}
        className={classes.root}
    >
        <Grid item>
            <Header />
        </Grid>
        <Grid item>
           <InfoSlider /> {explainerSlideIndex}
            <Button onClick={() => setExplainerSlideIndex(explainerSlideIndex + 1)} />
        </Grid>
        <Grid item>
            Where can I use it?
        </Grid>
        <Grid item>
            buy or connect metamask.
        </Grid>
    </Grid>
}