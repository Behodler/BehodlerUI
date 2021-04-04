import * as React from 'react'
import { useCallback, useEffect, useState, useContext } from 'react'
import { Button, Grid } from '@material-ui/core'
import API from "../../../../blockchain/ethereumAPI"
import titleImage from '../../../../images/behodler/liquidQueue/title2.png'
import AcknowledgmentScreen from './AcknowledgmentScreen'
import StakingScreen from './StakingScreen'
import LPList from './LPList'
// { createStyles, makeStyles } from '@material-ui/core/styles';
import { WalletContext } from "../../../Contexts/WalletStatusContext"

export default function LiquidityMining() {
    const walletContextProps = useContext(WalletContext)
    const [risksAcknowledged, setRisksAcknowledged] = useState<boolean>(!!localStorage.getItem('risks'))
    const [whiteListed, setWhiteListed] = useState<boolean>(false)
    const [unstakeClicked, setUnstakeClicked] = useState<boolean>(false)

    useEffect(() => {
        const effect = API.sluiceGateEffects.whiteListEffect()
        const subscription = effect.Observable.subscribe(enabled => {
            setWhiteListed(enabled)
        })

        return () => { subscription.unsubscribe(); effect.cleanup() }
    })

    const unstakeCallback = useCallback(async () => {
        const account = walletContextProps.account
        if (unstakeClicked) {
            const sluice = walletContextProps.contracts.behodler.Behodler2.LiquidQueue.SluiceGate
            const EYE_ETH_PAIR = await API.EYE_ETH_PAIR(walletContextProps.networkName, account)
            const EYE_SCX_PAIR = await API.EYE_SCX_PAIR(walletContextProps.networkName, account)

            const scxStake = BigInt((await sluice.LPstake(walletContextProps.account, EYE_SCX_PAIR).call()).toString())
            const eyeStake = BigInt((await sluice.LPstake(walletContextProps.account, EYE_ETH_PAIR).call()).toString())

            if (scxStake > 0)
                sluice.unstake(EYE_SCX_PAIR).send({ from: account }).on('receipt', function () {
                    location.reload();
                })

            if (eyeStake > 0)
                sluice.unstake(EYE_ETH_PAIR).send({ from: account }).on('receipt', function () {
                    location.reload();
                })

        }
    }, [unstakeClicked])

    useEffect(() => {
        unstakeCallback()
    })
    const acknowledge = () => {
        localStorage.setItem('risks', "1")
        setRisksAcknowledged(true)
    }

    let screen = whiteListed ? <LPList /> : <StakingScreen />
    if (!risksAcknowledged) {
        screen = <AcknowledgmentScreen acknowledge={acknowledge} />
    }


    return <div> <Grid
        container
        direction="column"
        justify="center"
        alignItems="center"
        spacing={4}
    >
        <Grid item>
            <img width={300} src={titleImage} />
        </Grid>
        <Grid item>
            {screen}
        </Grid>
        {whiteListed ?
            <Grid item><Button onClick={() => setUnstakeClicked(true)} variant="contained" color="secondary">Unstake deposit</Button></Grid> : <div></div>
        }
    </Grid>
    </div>
}