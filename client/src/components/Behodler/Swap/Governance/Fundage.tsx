import { Button, Grid} from '@material-ui/core'
import * as React from 'react'
import { useCallback, useContext, useEffect, useState } from 'react'

import { WalletContext } from '../../../Contexts/WalletStatusContext'

export default function Fundage(props: {}) {
    const context = useContext(WalletContext)
    const ironCrown = context.contracts.behodler.Behodler2.Morgoth.IronCrown
    const scx = context.contracts.behodler.Behodler2.Behodler2
    const [balance, setBalance] = useState<string>("")
    const [withdrawClicked, setWithdrawClicked] = useState<boolean>(false)


    useEffect(() => {
        scx.balanceOf(ironCrown.address)
            .call()
            .then(totalBal => {
                ironCrown
                    .getSilmaril("1")
                    .call()
                    .then(result => {
                        const percentage = BigInt(result[0].toString())
                        const totalBig = BigInt(totalBal.toString())
                        setBalance(((totalBig * percentage) / BigInt(1000)).toString())
                    })
            })
    })

    const withdrawCallback = useCallback(async () => {
        if (withdrawClicked) {
            await context.contracts.behodler.Behodler2.Morgoth.IronCrown.settlePayments().send({ from: context.account })
            setWithdrawClicked(false)
        }
    }, [withdrawClicked])

    useEffect(() => {
        withdrawCallback()
    }, [withdrawClicked])

    return (
        <Grid container
            direction="column"
            justify="center"
            alignItems="center"
            spacing={2}
        >
            <Grid item>
                <Grid
                    container
                    direction="row"
                    justify="center"
                    alignItems="center"
                >
                    <Grid item>
                        Balance:
                    </Grid>
                    <Grid item>
                        {balance}
                    </Grid>
                </Grid>
            </Grid>
            <Grid item>
                <Button onClick={() => setWithdrawClicked(true)}>Withdraw</Button>
            </Grid>
        </Grid>
    )
}