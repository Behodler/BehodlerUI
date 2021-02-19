import { Button, Grid, TextField } from '@material-ui/core'
import * as React from 'react'
import { useContext, useState, useCallback, useEffect } from 'react'

import { WalletContext } from '../../../Contexts/WalletStatusContext'

type indexRange = '0' | '1' | '2'
export default function SetSilmaril(props: {}) {
    const context = useContext(WalletContext)
    const [index, setIndex] = useState<indexRange>('0')
    const [percentage, setPercentage] = useState<number>(0)
    const [exit, setExit] = useState<string>("")
    const [click, setClick] = useState<boolean>(false)

    const setStringPercentage = (value: string) => {
        if (isNaN(parseInt(value)))
            setPercentage(0)
        const num = parseInt(value)
        setPercentage(num > 1000 ? 1000 : (num < 0 ? 0 : num))
    }

    const clickCallback = useCallback(async () => {
        if (click) {
            context.contracts.behodler.Behodler2.Morgoth.IronCrown.setSilmaril(index, '' + percentage, exit)
                .send({ from: context.account })
            setClick(false)
        }
    }, [click])

    useEffect(() => {
        clickCallback()
    })

    return <Grid container
        direction='row'
        alignItems="center"
        justify="center"
        spacing={3}>
        <Grid item>
            <TextField id="standard-basic" label="index" value={index} onChange={(event => setIndex(event.target.value as indexRange || '0'))} />
        </Grid>
        <Grid item>
            <TextField id="standard-basic" label="percentage" value={percentage} onChange={event => setStringPercentage(event.target.value)} />
        </Grid>
        <Grid item>
            <TextField id="standard-basic" label="exit" value={exit} onChange={event => setExit(event.target.value)} />
        </Grid>
        <Grid item>
            <Button onClick={() => setClick(true)}>Set</Button>
        </Grid>
    </Grid>
}