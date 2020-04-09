import * as React from 'react'
import { useState } from 'react'
import { useContext } from 'react'
import { WalletContext } from '../../../../Contexts/WalletStatusContext'
import { Paper, Typography, List, ListItem, Button } from '@material-ui/core'
import { ValueTextBox } from 'src/components/Common/ValueTextBox'
import ERC20 from './ERC20'

interface wethProps{

}

export default function Weth(props:wethProps){
    const walletContextProps = useContext(WalletContext)
    const token = walletContextProps.contracts.behodler.Weth
    const primaryOptions = { from: walletContextProps.account }
    const executeDeposit = (value: string) => token.deposit().send({from:walletContextProps.account,value:value})
    const executeWithdraw = (value: string) => token.withdraw(value).send(primaryOptions)

    return <List>
        <ListItem key="executeDeposit">
            <Deposit execute={executeDeposit} />
        </ListItem>
        <ListItem key="Withdraw">
            <Withdraw execute={executeWithdraw} />
        </ListItem>
        <ListItem key="ERC20">
            <ERC20 token={token} />
        </ListItem>
    </List>
}


interface depositProps {
    execute: (value: string) => Promise<void>
}

function Deposit(props: depositProps) {
    const [value, setValue] = useState<string>("")

    return <Paper>
        <Typography variant="h5">Deposit</Typography>
        <List>
            <ListItem key="value">
                <ValueTextBox placeholder="value" changeText={setValue} text={value} />
            </ListItem>
            <ListItem key="button">
                <Button variant="contained" color="secondary" onClick={async () => await props.execute(value)}>Execute</Button>
            </ListItem>
        </List>
    </Paper>
}

interface withdrawProps {
    execute: (value: string) => Promise<void>
}

function Withdraw(props: withdrawProps) {
    const [value, setValue] = useState<string>("")

    return <Paper>
        <Typography variant="h5">Withdraw</Typography>
        <List>
            <ListItem key="value">
                <ValueTextBox placeholder="value" changeText={setValue} text={value} />
            </ListItem>
            <ListItem key="button">
                <Button variant="contained" color="secondary" onClick={async () => await props.execute(value)}>Execute</Button>
            </ListItem>
        </List>
    </Paper>
}