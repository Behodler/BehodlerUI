import * as React from 'react'
import TradingPanel from './TradingPanel/index'
import { Container } from '@material-ui/core'

interface props {

}

export default function Swap(props: props) {
    return <Container>
        <TradingPanel />
    </Container>
}