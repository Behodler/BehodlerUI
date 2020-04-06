import * as React from 'react'
import { useContext } from 'react'
import { List, ListItem, TextField, Typography, Paper, Button } from '@material-ui/core'
import { useState } from 'react'
import { WalletContext } from '../../../../Contexts/WalletStatusContext'

interface behodlerProps {

}

export default function Behodler(props: behodlerProps) {
    const walletContextProps = useContext(WalletContext)

    const [lachesis, setLachesis] = useState<string>("")
    const [kharon, setKharon] = useState<string>("")
    const [janus, setJanus] = useState<string>("")
    const [chronos, setChronos] = useState<string>("")
    const [token, setTokenAddress] = useState<string>("")
    const [value, setValue] = useState<string>("")
    const [average, setAverage] = useState("")

    const executeSeed = async () => {
        await walletContextProps.contracts.behodler.Behodler.seed(lachesis, kharon, janus, chronos).send({ from: walletContextProps.account })
    }
    const getAverage = async () => {
        const ave = (await walletContextProps.contracts.behodler.Behodler.calculateAverageScarcityPerToken(token, value).call()).toString()
        setAverage(ave)
    }

    return <div>
        <List>
            <ListItem key="seed">
                <Paper>
                    <Typography variant="h5">Seed </Typography>
                    <List>
                        <ListItem key="lachesis">
                            <TextField label="lachesis" onChange={(event) => { setLachesis(event.target.value) }}>{lachesis}</TextField>
                        </ListItem>
                        <ListItem key="kharon">
                            <TextField label="kharon" onChange={(event) => { setKharon(event.target.value) }}>{kharon}</TextField>
                        </ListItem>
                        <ListItem key="janus">
                            <TextField label="janus" onChange={(event) => { setJanus(event.target.value) }}>{janus}</TextField>
                        </ListItem>
                        <ListItem key="chronos">
                            <TextField label="chronos" onChange={(event) => { setChronos(event.target.value) }}>{chronos}</TextField>
                        </ListItem>
                    </List>
                    <Button variant="contained" color="secondary" onClick={executeSeed}>Execute</Button>
                </Paper>
            </ListItem>
            <ListItem key="calculateAverage">
                <Paper>
                    <Typography variant="h5">CalculateAverageScarcityPerToken </Typography>
                    <List>
                        <ListItem key="token">
                            <TextField label="token" onChange={(event) => { setTokenAddress(event.target.value) }}>{token}</TextField>
                        </ListItem>
                        <ListItem key="value">
                            <TextField label="value (uint)" onChange={(event) => { setValue(event.target.value) }}>{value}</TextField>
                        </ListItem>
                        <ListItem key="Button">
                            <Button variant="contained" color="secondary" onClick={getAverage}>Execute</Button>
                        </ListItem>
                        <ListItem key="output">
                            {average}
                        </ListItem>
                    </List>
                </Paper>
            </ListItem>
        </List>
    </div>
}