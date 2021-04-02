import * as React from 'react'
import { useEffect, useState } from 'react'
import { Grid } from '@material-ui/core'
import API from "../../../../blockchain/ethereumAPI"
import titleImage from '../../../../images/behodler/liquidQueue/title.png'
import AcknowledgmentScreen from './AcknowledgmentScreen'
import StakingScreen from './StakingScreen'
export default function LiquidityMining() {
    const [risksAcknowledged, setRisksAcknowledged] = useState<boolean>(!!localStorage.getItem('risks'))
    const [whiteListed, setWhiteListed] = useState<boolean>(false)
    useEffect(() => {
        const effect = API.sluiceGateEffects.whiteListEffect()
        const subscription = effect.Observable.subscribe(enabled => {
            setWhiteListed(enabled)
        })

        return () => { subscription.unsubscribe(); effect.cleanup() }
    })

    const acknowledge = () => {
        localStorage.setItem('risks', "1")
        setRisksAcknowledged(true)
    }

    let screen = whiteListed ? <div>QUEUE</div> : <StakingScreen />
    if (!risksAcknowledged) {
        screen = <AcknowledgmentScreen acknowledge={acknowledge} />
    }

    return <Grid
        container
        direction="column"
        justify="center"
        alignItems="center"
        spacing={4}
    >
        <Grid item>
            <img width={240} src={titleImage} />
        </Grid>
            <Grid item>
                {screen}
            </Grid>
        </Grid>
}