import * as React from 'react'
import TradingBox from './TradingBox/index'
import { Container } from '@material-ui/core'

interface props {

}

export default function Swap(props: props) {
    return <Container>
        <TradingBox />
    </Container>
}