import * as React from 'react'
import { useState } from 'react'
import { useContext } from 'react'
import { WalletContext } from '../../../../Contexts/WalletStatusContext'
import { Paper, Typography, List, ListItem, Button } from '@material-ui/core'
import { ValueTextBox } from '../../../../Common/ValueTextBox'

interface chronosProps {}

export default function Chronos(props: chronosProps) {
    const [behodler, setBehodler] = useState<string>('')
    const walletContextProps = useContext(WalletContext)
    const execute = async (b) => walletContextProps.contracts.behodler.Chronos.seed(b).send({ from: walletContextProps.account })

    return (
        <List>
            <ListItem key="seed">
                <Paper>
                    <Typography variant="h5">Seed</Typography>
                    <List>
                        <ValueTextBox text={behodler} placeholder="behodler" changeText={setBehodler} />
                    </List>
                </Paper>
            </ListItem>
            <ListItem key="execute">
                <Button variant="contained" color="secondary" onClick={async () => await execute(behodler)}>
                    Execute
                </Button>
            </ListItem>
        </List>
    )
}
