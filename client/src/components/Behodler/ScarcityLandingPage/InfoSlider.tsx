import * as React from 'react'
import { makeStyles, Card, CardContent, Container } from '@material-ui/core'
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
    Slide({ header: "hello" })
    return <SwipeableViews enableMouseEvents
        index={index}
        onChangeIndex={(i) => setIndex(i % 3)}
    >
        <div className={classes.slide1}>
            <Container>
                <Card>
                    <CardContent>
                        Hello there, my name is mike
               </CardContent>

                </Card>
            </Container>
        </div>
        <div className={classes.slide2}>
            <Card>
                <CardContent>
                    Hello there, my name is mike
               </CardContent>
            </Card>
        </div>
        <div className={classes.slide3}>
            <Card>
                <CardContent>
                    Hello there, my name is mike
               </CardContent>
            </Card>
        </div>
        <div className={classes.slide1}>
            <Card>
                <CardContent>
                    Hello there, my name is mike
               </CardContent>
            </Card>
        </div>
    </SwipeableViews>
}

interface slideProps {
    header: string
}

function Slide(props: slideProps) {

}