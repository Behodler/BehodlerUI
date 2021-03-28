import * as React from 'react'
import { useState } from 'react'
import { useContext } from 'react'
import { WalletContext } from '../../../../Contexts/WalletStatusContext'
import { Paper, Typography, List, ListItem, Button } from '@material-ui/core'
import { ValueTextBox } from '../../../../Common/ValueTextBox'
import ERC20 from './ERC20'

interface scarcityProps {}

export default function Scarcity(props: scarcityProps) {
    const walletContextProps = useContext(WalletContext)
    const token = walletContextProps.contracts.behodler.Scarcity
    const primaryOptions = { from: walletContextProps.account }
    const executeSetBehodler = (address: string) => token.setBehodler(address).send(primaryOptions)
    const executeBurn = (value: string) => token.burn(value).send(primaryOptions)

    return (
        <List>
            <ListItem key="setBehodler">
                <SetBehodler execute={executeSetBehodler} />
            </ListItem>
            <ListItem key="Burn">
                <Burn execute={executeBurn} />
            </ListItem>
            <ListItem key="ERC20">
                <ERC20 token={token} />
            </ListItem>
        </List>
    )
}

interface setBehodlerProps {
    execute: (behodler: string) => Promise<void>
}

function SetBehodler(props: setBehodlerProps) {
    const [behodler, setBehodler] = useState<string>('')

    return (
        <Paper>
            <Typography variant="h5">Set Behodler</Typography>
            <List>
                <ListItem key="behodler">
                    <ValueTextBox placeholder="set behodler" changeText={setBehodler} text={behodler} />
                </ListItem>
                <ListItem key="button">
                    <Button variant="contained" color="secondary" onClick={async () => await props.execute(behodler)}>
                        Execute
                    </Button>
                </ListItem>
            </List>
        </Paper>
    )
}

interface burnProps {
    execute: (value: string) => Promise<void>
}

function Burn(props: burnProps) {
    const [value, setValue] = useState<string>('')

    return (
        <Paper>
            <Typography variant="h5">Burn</Typography>
            <List>
                <ListItem key="value">
                    <ValueTextBox placeholder="value" changeText={setValue} text={value} />
                </ListItem>
                <ListItem key="button">
                    <Button variant="contained" color="secondary" onClick={async () => await props.execute(value)}>
                        Execute
                    </Button>
                </ListItem>
            </List>
        </Paper>
    )
}
