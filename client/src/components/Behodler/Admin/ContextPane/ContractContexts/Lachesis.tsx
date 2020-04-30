import * as React from 'react'
import { useState } from 'react'
import { useContext } from 'react'
import { WalletContext } from '../../../../Contexts/WalletStatusContext'
import { Paper, Typography, List, ListItem, Button, Checkbox } from '@material-ui/core'
import { ValueTextBox } from 'src/components/Common/ValueTextBox'

interface lachesisProps {

}

export default function Lachesis(props: lachesisProps) {
    const walletContextProps = useContext(WalletContext)
    const primaryOptions = { from: walletContextProps.account }
    const setScarcity = async (scx: string) => walletContextProps.contracts.behodler.Lachesis.setScarcity(scx).send(primaryOptions)
    const executeMeasure = async (token: string, valid: boolean) => walletContextProps.contracts.behodler.Lachesis.measure(token, valid).send(primaryOptions)
    const executeCut = async (token: string) => walletContextProps.contracts.behodler.Lachesis.cut(token).send(primaryOptions)

    return <List>
        <ListItem key="setScarcity">
            <SetScarcity setScarcity={setScarcity} />
        </ListItem>
        <ListItem key="Measure">
            <Measure execute={executeMeasure} />
        </ListItem>
        <ListItem key="Cut">
            <Cut execute={executeCut} />
        </ListItem>
    </List>
}

interface setScarcityProps {
    setScarcity: (scx: string) => Promise<void>
}

function SetScarcity(props: setScarcityProps) {
    const [scx, setScx] = useState<string>("")

    return <Paper>
        <Typography variant="h5">SetScarcity</Typography>
        <List>
            <ListItem key="scx">
                <ValueTextBox text={scx} placeholder="Scarcity" changeText={setScx} />
            </ListItem>
            <ListItem>
                <Button variant="contained" color="secondary" onClick={async () => await props.setScarcity(scx)}>Execute</Button>
            </ListItem>
        </List>
    </Paper>
}

interface measureProps {
    execute: (token: string, valid: boolean) => Promise<void>
}

function Measure(props: measureProps) {
    const [token, setToken] = useState<string>("")
    const [valid, setValid] = useState<boolean>(false)

    const handleChangeOfValid = (event) => {
        setValid(event.target.checked);
    };


    return <Paper>
        <Typography variant="h5">Measure</Typography>
        <List>
            <ListItem key="token">
                <ValueTextBox text={token} placeholder="Token" changeText={setToken} />
            </ListItem>
            <ListItem key="valid">
                <Checkbox
                    checked={valid}
                    onChange={handleChangeOfValid}
                    inputProps={{ 'aria-label': 'primary checkbox' }}
                />
            </ListItem>
            <ListItem>
                <Button variant="contained" color="secondary" onClick={async () => await props.execute(token, valid)}>Execute</Button>
            </ListItem>
        </List>
    </Paper>
}


interface cutProps {
    execute: (token: string) => Promise<string>
}

function Cut(props: cutProps) {
    const [token, setToken] = useState<string>("")

    return <Paper>
        <Typography variant="h5">Cut</Typography>
        <List>
            <ListItem key="token">
                <ValueTextBox text={token} placeholder="Token" changeText={setToken} />
            </ListItem>

            <ListItem>
                <Button variant="contained" color="secondary" onClick={async () => { await props.execute(token) }}>Execute</Button>
            </ListItem>

        </List>
    </Paper>
}