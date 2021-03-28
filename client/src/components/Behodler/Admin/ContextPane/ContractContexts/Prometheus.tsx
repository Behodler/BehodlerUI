import * as React from 'react'
import { useState } from 'react'
import { useContext } from 'react'
import { WalletContext } from '../../../../Contexts/WalletStatusContext'
import { Paper, Typography, List, ListItem, Button } from '@material-ui/core'
import { ValueTextBox } from '../../../../Common/ValueTextBox'

interface prometheusProps {}

export default function Prometheus(props: prometheusProps) {
    const walletContextProps = useContext(WalletContext)
    const primaryOptions = { from: walletContextProps.account }
    const executeSeed = async (kharon: string, scarcity: string, weidai: string, dai: string, registry: string) =>
        walletContextProps.contracts.behodler.Prometheus.seed(kharon, scarcity, weidai, dai, registry).send(primaryOptions)
    const executeStealFlame = async (token: string, kharonToll: string, buyer: string) =>
        walletContextProps.contracts.behodler.Prometheus.stealFlame(token, kharonToll, buyer).call(primaryOptions)

    return (
        <List>
            <ListItem key="seed">
                <Seed execute={executeSeed} />
            </ListItem>
            <ListItem key="StealFlame">
                <StealFlame execute={executeStealFlame} />
            </ListItem>
        </List>
    )
}

interface seedProps {
    execute: (kharon: string, scarcity: string, weidai: string, dai: string, registry: string) => Promise<void>
}

function Seed(props: seedProps) {
    const [kharon, setKharon] = useState<string>('')
    const [scarcity, setScarcity] = useState<string>('')
    const [weidai, setWeiDai] = useState<string>('')
    const [dai, setDai] = useState<string>('')
    const [registry, setRegistry] = useState<string>('')

    return (
        <Paper>
            <Typography variant="h5">Seed</Typography>
            <List>
                <ListItem key="kharon">
                    <ValueTextBox text={kharon} placeholder="Kharon" changeText={setKharon} />
                </ListItem>
                <ListItem key="scarcity">
                    <ValueTextBox text={scarcity} placeholder="Scarcity" changeText={setScarcity} />
                </ListItem>
                <ListItem key="weidai">
                    <ValueTextBox text={weidai} placeholder="WeiDai" changeText={setWeiDai} />
                </ListItem>
                <ListItem key="dai">
                    <ValueTextBox text={dai} placeholder="Dai" changeText={setDai} />
                </ListItem>
                <ListItem key="registry">
                    <ValueTextBox text={registry} placeholder="Registry" changeText={setRegistry} />
                </ListItem>
                <ListItem>
                    <Button variant="contained" color="secondary" onClick={async () => await props.execute(kharon, scarcity, weidai, dai, registry)}>
                        Execute
                    </Button>
                </ListItem>
            </List>
        </Paper>
    )
}

interface stealFlameProps {
    execute: (token: string, kharonToll: string, buyer: string) => Promise<string>
}

function StealFlame(props: stealFlameProps) {
    const [token, setToken] = useState<string>('')
    const [kharonToll, setKharonToll] = useState<string>('')
    const [buyer, setBuyer] = useState<string>('')
    const [output, setOutput] = useState<string>('')

    return (
        <Paper>
            <Typography variant="h5">Steal Flame</Typography>
            <List>
                <ListItem key="token">
                    <ValueTextBox text={token} placeholder="Token" changeText={setToken} />
                </ListItem>
                <ListItem key="kharonToll">
                    <ValueTextBox text={kharonToll} placeholder="Kharon Toll" changeText={setKharonToll} />
                </ListItem>
                <ListItem key="buyer">
                    <ValueTextBox text={buyer} placeholder="Buyer Account" changeText={setBuyer} />
                </ListItem>
                <ListItem key="button">
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={async () => {
                            const out = await props.execute(token, kharonToll, buyer)
                            setOutput(out.toString())
                        }}
                    >
                        Execute
                    </Button>
                </ListItem>
                <ListItem key="out">{output}</ListItem>
            </List>
        </Paper>
    )
}
