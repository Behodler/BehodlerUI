import * as React from 'react'
import TradeBox from "./TradeBox/index"
import { Container } from '@material-ui/core'

interface props {

}


export default function ExtendedTextField(props: props) {
    return <Container>
        <TradeBox />
    </Container>
}