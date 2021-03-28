import * as React from 'react'
import { useState } from 'react'
import { useContext } from 'react'
import { WalletContext } from '../../../../Contexts/WalletStatusContext'
import { Paper, Typography, List, ListItem, Button } from '@material-ui/core'
import { ValueTextBox } from '../../../../Common/ValueTextBox'

interface bellowsProps {}

export default function Bellows(props: bellowsProps) {
    const walletContextProps = useContext(WalletContext)
    const executeSeed = async (l: string, r: string) => {
        await walletContextProps.contracts.behodler.Bellows.seed(l, r).send({ from: walletContextProps.account })
    }

    const executeOpen = async (b: string, v: string) => {
        await walletContextProps.contracts.behodler.Bellows.open(b, v).send({ from: walletContextProps.account })
    }

    return (
        <List>
            <ListItem key="Seed">
                <Seed executeSeed={executeSeed} />
            </ListItem>
            <ListItem key="Open">
                <Open executeOpen={executeOpen} />
            </ListItem>
        </List>
    )
}

interface seedProps {
    executeSeed: (lachesis: string, registry: string) => Promise<void>
}

function Seed(props: seedProps) {
    const [lachesis, setLachesis] = useState<string>('')
    const [pyroTokenRegistry, setPyroTokenRegistry] = useState<string>('')

    return (
        <Paper>
            <Typography variant="h5">Seed </Typography>
            <List>
                <ListItem key="lachesis">
                    <ValueTextBox text={lachesis} placeholder="lachesis" changeText={setLachesis} />
                </ListItem>
                <ListItem key="registry">
                    <ValueTextBox text={pyroTokenRegistry} placeholder="Registry" changeText={setPyroTokenRegistry} />
                </ListItem>
            </List>
            <Button variant="contained" color="secondary" onClick={async () => await props.executeSeed(lachesis, pyroTokenRegistry)}>
                Execute
            </Button>
        </Paper>
    )
}

interface openProps {
    executeOpen: (baseToken: string, value: string) => void
}

function Open(props: openProps) {
    const [baseToken, setBaseToken] = useState<string>('')
    const [value, setValue] = useState<string>('')

    return (
        <Paper>
            <Typography variant="h5">Seed </Typography>
            <List>
                <ListItem key="base">
                    <ValueTextBox text={baseToken} placeholder="baseToken" changeText={setBaseToken} />
                </ListItem>
                <ListItem key="value">
                    <ValueTextBox text={value} placeholder="Value (uint)" changeText={setValue} />
                </ListItem>
            </List>
            <Button variant="contained" color="secondary" onClick={async () => await props.executeOpen(baseToken, value)}>
                Execute
            </Button>
        </Paper>
    )
}
