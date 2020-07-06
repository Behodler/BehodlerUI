import * as React from 'react'
import { makeStyles } from '@material-ui/core'
import SwipeableViews from 'react-swipeable-views';
import { useState } from 'react'

interface infoSliderPropsProps {

}

const useStyles = makeStyles({
    slide1: {
        minHeight: "50px",
        backgroundColor: "blue",
        color: "white"
    },
    slide2: {
        minHeight: "50px",
        backgroundColor: "cyan",
        color: "white"
    },
    slide3: {
        minHeight: "50px",
        backgroundColor: "red",
        color: "white"
    }
})
export default function InfoSlider(props: infoSliderPropsProps) {
    const classes = useStyles()
    const [index, setIndex] = useState<number>(0)
    Slide({header:"hello"})
    return <SwipeableViews enableMouseEvents
        index={index}
        onChangeIndex={(i) => setIndex(i % 3)}
    >
        <div className={classes.slide1}>
            Hello
    </div>
        <div className={classes.slide2}>
            there
    </div>
        <div className={classes.slide3}>
            person
    </div>
        <div className={classes.slide1}>
            Hello
    </div>
    </SwipeableViews>
}

interface slideProps{
header:string
}

function Slide(props:slideProps) {

}