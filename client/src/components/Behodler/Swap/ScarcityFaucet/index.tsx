import * as React from 'react'
import { useState, useEffect, useContext } from 'react'
import { WalletContext } from "../../../Contexts/WalletStatusContext"
import { Grid, Button } from '@material-ui/core'
import faucet from '../../../../images/behodler/sisyphus/faucet.png'
import Stat from '../Stat'
import API from '../../../../blockchain/ethereumAPI'
import BigNumber from 'bignumber.js'
interface props {

}
/*
    Drip size
    next drip in X blocks
    lastRecipient 
    drips remaining
    drip button
*/
export default function ScarcityFaucet(props: props) {
    const walletContextProps = useContext(WalletContext)
    const [dripSize, setDripSize] = useState<string>("")
    const [nextDrip, setNextDrip] = useState<string>("")
    const [lastRecipient, setLastRecipient] = useState<string>("")
    const [dripsRemaining, setDripsRemaining] = useState<string>("")
    const [dripEnabled, setDripEnabled] = useState<boolean>(false)

    useEffect(() => {
        const effect = API.scarcityFaucetEffects.dripsSize(walletContextProps.account)
        const subscription = effect.Observable.subscribe(size => {
            setDripSize(size)
        })
        return () => { subscription.unsubscribe(); effect.cleanup() }
    })


    useEffect(() => {
        const effect = API.scarcityFaucetEffects.lastRecipient(walletContextProps.account)
        const subscription = effect.Observable.subscribe(rec => {
            setLastRecipient(rec)
        })
        return () => { subscription.unsubscribe(); effect.cleanup() }
    })

    useEffect(() => {
        const effect = API.scarcityFaucetEffects.dripsRemaining(walletContextProps.account)
        const subscription = effect.Observable.subscribe(rem => {
            setDripsRemaining(rem)
        })
        return () => { subscription.unsubscribe(); effect.cleanup() }
    })


    useEffect(() => {
        const effect = API.scarcityFaucetEffects.lastDrip(walletContextProps.account)
        const subscription = effect.Observable.subscribe(result => {
            const bigLast = new BigNumber(result.last)
            const bigCurrent = new BigNumber(result.blockNumber)
            walletContextProps.contracts.behodler.Sisyphus.Faucet.dripInterval()
                .call({ from: walletContextProps.account })
                .then((int) => {
                    const bigInterval = new BigNumber(int)
                    const next = bigLast.plus(bigInterval)
                    if (next.isGreaterThan(bigCurrent)) {
                        setNextDrip(next.minus(bigCurrent).toString())
                        setDripEnabled(false)
                    } else {
                        setNextDrip("0")
                        setDripEnabled(true)
                    }
                })
        })
        return () => { subscription.unsubscribe(); effect.cleanup() }
    })


    const scxFormatter = (v: string) => v + ' scx'

    return <Grid
        container
        direction="column"
        justify="center"
        alignItems="center"
        spacing={2}
    >

        <Grid item>
            <img width="300px" src={faucet} />
        </Grid>
        <Grid item>
            <Stat label="Drip Size" value={scxFormatter(dripSize)} />
        </Grid>
        <Grid item>
            <Stat label="Last recipient" value={lastRecipient} />
        </Grid>
        <Grid item>
            <Stat label="Drips remaining" value={dripsRemaining} />
        </Grid>
        {dripEnabled ? "" :
            <Grid item>
                <Stat label="Blocks until next drip" value={nextDrip} />
            </Grid>}
        <Grid item>
            <Button variant="contained" disabled={!dripEnabled} color="primary" onClick={async () => await walletContextProps.contracts.behodler.Sisyphus.Faucet.drip().send({ from: walletContextProps.account })} >
                DRIP
            </Button>
        </Grid>
    </Grid>
}