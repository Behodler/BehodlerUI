import * as React from 'react'
import { useState, useEffect } from 'react'
import { useContext } from 'react'
import { WalletContext } from '../../../../Contexts/WalletStatusContext'
import { Paper, Typography, List, ListItem, Button } from '@material-ui/core'
import { ValueTextBox } from 'src/components/Common/ValueTextBox'
import BigNumber from 'bignumber.js'


interface faucetProps {

}

export default function Faucet(props: faucetProps) {
    const walletContextProps = useContext(WalletContext)
    const faucet = walletContextProps.contracts.behodler.Sisyphus.Faucet
    const primaryOptions = { from: walletContextProps.account }

    const executeSeed = (scx: string) => faucet.seed(scx).send(primaryOptions)
    const executeCalibrate = (interval: string, drips: string) => faucet.calibrate(interval, drips).send(primaryOptions)
    const executeReplaceWasher = () => faucet.replaceWasher().send(primaryOptions)

    return <List>
        <ListItem>
            <Seed execute={executeSeed} />
        </ListItem>
        <ListItem>
            <Calibrate execute={executeCalibrate} />
        </ListItem>
        <ListItem>
            <ReplaceWasher execute={executeReplaceWasher} />
        </ListItem>
    </List>
}

interface seedProps {
    execute: (scx: string) => Promise<void>
}


function Seed(props: seedProps) {
    const walletContextProps = useContext(WalletContext)
    const [scx, setScx] = useState<string>("")

    useEffect(() => {
        walletContextProps.contracts.behodler.Sisyphus.Faucet.scarcity().call({ from: walletContextProps.account }).then(s => {
            setScx(s)
        })
    }, [])

    return <Paper>
        <Typography variant="h5">Seed</Typography>
        <List>
            <ListItem key="scx">
                <ValueTextBox placeholder="scx" changeText={setScx} text={scx} />
            </ListItem>
            <ListItem key="button">
                <Button variant="contained" color="secondary" onClick={async () => await props.execute(scx)}>Execute</Button>
            </ListItem>
        </List>
    </Paper>
}

interface calibrateProps {
    execute: (interval: string, drips: string) => any
}

function Calibrate(props: calibrateProps) {
    const walletContextProps = useContext(WalletContext)
    const [interval, setInterval] = useState<string>("")
    const [drips, setDrips] = useState<string>("")

    useEffect(() => {
        walletContextProps.contracts.behodler.Sisyphus.Faucet.dripInterval().call({ from: walletContextProps.account })
            .then(i => {
                setInterval(i)
            })
    }, [])

    useEffect(() => {
        walletContextProps.contracts.behodler.Sisyphus.Faucet.drips().call({ from: walletContextProps.account })
            .then(d => {
                setDrips(d)
            })
    }, [])

    return <Paper>
        <Typography variant="h5">Calibrate</Typography>
        <List>
            <ListItem key="Drip Interval">
                <ValueTextBox placeholder="interval (in blocks)" changeText={setInterval} text={interval} />
            </ListItem>
            <ListItem key="Total drips">
                <ValueTextBox placeholder="Drips" changeText={setDrips} text={drips} />
            </ListItem>
            <ListItem key="button">
                <Button variant="contained" color="secondary" onClick={async () => await props.execute(interval, drips)}>Execute</Button>
            </ListItem>
        </List>
    </Paper>

}

interface replaceWasherProps {
    execute: () => void
}

function ReplaceWasher(props: replaceWasherProps) {
    const walletContextProps = useContext(WalletContext)
    const [checkReplaceClicked, setCheckReplaceClicked] = useState<boolean>(false)
    const [statusText, setStatusText] = useState<string>("")
    const [statusColor, setStatusColor] = useState<'textPrimary' | 'secondary'>('textPrimary')
    const primaryOptions = { from: walletContextProps.account }

    var checkTightenCallback = React.useCallback(async () => {
        if (checkReplaceClicked) {
            const faucetAddress = walletContextProps.contracts.behodler.Sisyphus.Faucet.address
            const scxBal = new BigNumber(await walletContextProps.contracts.behodler.Scarcity.balanceOf(faucetAddress).call(primaryOptions))
            const lastKnownBalance = new BigNumber(await walletContextProps.contracts.behodler.Sisyphus.Faucet.lastKnownBalance().call(primaryOptions))
            if (scxBal.isEqualTo(lastKnownBalance)) {
                setStatusText("washer does not need replacing")
                setStatusColor('textPrimary')
            } else {
                setStatusText("washer needs replacing")
                setStatusText('secondary')
            }
            setCheckReplaceClicked(false)

        }
    }, [checkReplaceClicked])

    useEffect(() => {
        checkTightenCallback()
    })


    return <Paper>
        <Typography variant="h5">Replace Washer</Typography>
        <Typography variant="h6" color={statusColor}>{statusText}</Typography>
        <List>

            <ListItem key="check">
                <Button variant="contained" color="secondary" onClick={() => { setCheckReplaceClicked(true); setStatusText("checking...") }}>Check if tighten needs to happen</Button>
            </ListItem>
            <ListItem key="button">
                <Button variant="contained" color="secondary" onClick={async () => await props.execute()}>Tighten Washer</Button>
            </ListItem>
        </List>
    </Paper>


}