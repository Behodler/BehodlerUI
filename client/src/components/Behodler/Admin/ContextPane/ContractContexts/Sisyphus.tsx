import * as React from 'react'
import { useState, useEffect } from 'react'
import { useContext } from 'react'
import { WalletContext } from '../../../../Contexts/WalletStatusContext'
import { Paper, Typography, List, ListItem, Button, Checkbox } from '@material-ui/core'
import { ValueTextBox } from 'src/components/Common/ValueTextBox'

interface sisyphusProps {

}

export default function Sisyphus(props: sisyphusProps) {
    const walletContextProps = useContext(WalletContext)
    const sisyphus = walletContextProps.contracts.behodler.Sisyphus.Sisyphus
    const primaryOptions = { from: walletContextProps.account }
    const executeEnable = (enabled: boolean) => sisyphus.enable(enabled).send(primaryOptions)
    const executeSetTime = (periodDurationType: string, totalIncrements: string) => sisyphus.setTime(periodDurationType, totalIncrements).send(primaryOptions)
    const executeSetProportion = (proportion: string) => sisyphus.setRewardProportion(proportion).send(primaryOptions)
    const executeSeed = (scx: string) => sisyphus.seed(scx).send(primaryOptions)

    return <List>
        <ListItem key="Set Enabled">
            <Enable execute={executeEnable} />
        </ListItem>
        <ListItem key="Set time">
            <SetTime execute={executeSetTime} />
        </ListItem>
        <ListItem key="Set Reward Proportion">
            <SetRewardProportion execute={executeSetProportion} />
        </ListItem>
        <ListItem key="Seed">
            <Seed execute={executeSeed} />
        </ListItem>
    </List>
}

interface enableProps {
    execute: (e: boolean) => Promise<void>
}

function Enable(props: enableProps) {
    const walletContextProps = useContext(WalletContext)
    const [enable, setEnable] = useState<boolean>(false)
    useEffect(() => {
        walletContextProps.contracts.behodler.Sisyphus.Sisyphus.enabled().call({ from: walletContextProps.account })
            .then(result => {
                setEnable(result)
            })
    }, [])

    const handleChangeOfValid = (event) => {
        setEnable(event.target.checked);
    };

    return <Paper>
        <Typography variant="h5">Enable</Typography>
        <List>
            <ListItem key="enable">
                <Checkbox
                    checked={enable}
                    onChange={handleChangeOfValid}
                    inputProps={{ 'aria-label': 'primary checkbox' }}
                />
            </ListItem>
            <ListItem key="button">
                <Button variant="contained" color="secondary" onClick={async () => await props.execute(enable)}>Execute</Button>
            </ListItem>
        </List>
    </Paper>
}

interface setTimeProps {
    execute: (periodDurationType: string, totalIncrements: string) => Promise<void>
}

function SetTime(props: setTimeProps) {
    const walletContextProps = useContext(WalletContext)
    const [duration, setDuration] = useState<string>("")
    const [totalIncrements, setTotalIncrements] = useState<string>("")

    useEffect(() => {
        walletContextProps.contracts.behodler.Sisyphus.Sisyphus.periodDuration().call({ from: walletContextProps.account }).then(d => {
            setDuration(d)
            walletContextProps.contracts.behodler.Sisyphus.Sisyphus.totalIncrements().call({ from: walletContextProps.account }).then(i => {
                setTotalIncrements(i)
            })
        })
    }, [])

    return <Paper>
        <Typography variant="h5">Set Time</Typography>
        <List>
            <ListItem key="duration">
                <ValueTextBox placeholder="duration" changeText={setDuration} text={duration} />
            </ListItem>
            <ListItem key="total Increments">
                <ValueTextBox placeholder="increments" changeText={setTotalIncrements} text={totalIncrements} />
            </ListItem>
            <ListItem key="button">
                <Button variant="contained" color="secondary" onClick={async () => await props.execute(duration, totalIncrements)}>Execute</Button>
            </ListItem>
        </List>
    </Paper>
}


interface setRewardProportionProps {
    execute: (proportion: string) => Promise<void>
}

function SetRewardProportion(props: setRewardProportionProps) {
    const walletContextProps = useContext(WalletContext)
    const [proportion, setProportion] = useState<string>("")

    useEffect(() => {
        walletContextProps.contracts.behodler.Sisyphus.Sisyphus.rewardProportion().call({ from: walletContextProps.account }).then(p => {
            setProportion(p)
        })
    }, [])

    return <Paper>
        <Typography variant="h5">Set Reward Proportion</Typography>
        <List>
            <ListItem key="proportion">
                <ValueTextBox placeholder="proportion" changeText={setProportion} text={proportion} />
            </ListItem>
            <ListItem key="button">
                <Button variant="contained" color="secondary" onClick={async () => await props.execute(proportion)}>Execute</Button>
            </ListItem>
        </List>
    </Paper>
}

interface seedProps {
    execute: (scx: string) => Promise<void>
}

function Seed(props: seedProps) {
    const walletContextProps = useContext(WalletContext)
    const [scx, setScx] = useState<string>("")

    useEffect(() => {
        walletContextProps.contracts.behodler.Sisyphus.Sisyphus.scarcity().call({ from: walletContextProps.account }).then(s => {
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