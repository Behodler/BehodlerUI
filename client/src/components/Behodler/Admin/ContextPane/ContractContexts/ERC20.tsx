import * as React from 'react'
import { useState } from 'react'
import { useContext } from 'react'
import { WalletContext } from '../../../../Contexts/WalletStatusContext'
import { Paper, Typography, List, ListItem, Button } from '@material-ui/core'
import { ValueTextBox } from 'src/components/Common/ValueTextBox'
import { ERC20 } from '../../../../../blockchain/contractInterfaces/ERC20'

interface ERC20Props {
    token: ERC20
}

export default function ERC20Section(props: ERC20Props) {
    const walletContextProps = useContext(WalletContext)
    const primaryOptions = { from: walletContextProps.account }

    const executeSupply = () => props.token.totalSupply().call(primaryOptions)
    const executeBalanceOf = (address: string) => props.token.balanceOf(address).call(primaryOptions)
    const executeAllowance = (owner: string, spender: string) => props.token.allowance(owner, spender).call(primaryOptions)
    const executeTransfer = (to: string, value: string) => props.token.transfer(to, value).send(primaryOptions)
    const executeApprove = (spender: string, value: string) => props.token.approve(spender, value).send(primaryOptions)
    const executeTransferFrom = (from: string, to: string, value: string) => props.token.transferFrom(from, to, value).send(primaryOptions)
    const executeIncreaseAllowance = (spender: string, addedValue: string) => props.token.increaseAllowance(spender, addedValue).send(primaryOptions)
    const executeDecreaseAllowance = (spender: string, subtractedValue: string) => props.token.decreaseAllowance(spender, subtractedValue).send(primaryOptions)
    const executeDecimals = () => props.token.decimals().call(primaryOptions)
    const executeSymbol = () => props.token.symbol().call(primaryOptions)
    const executeName = () => props.token.name().call(primaryOptions)

    return <List>
        <ListItem key="seed">
            <TotalSupply execute={executeSupply} />
        </ListItem>
        <ListItem key="balanceOf">
            <BalanceOf execute={executeBalanceOf} />
        </ListItem>
        <ListItem key="Allowance">
            <Allowance execute={executeAllowance} />
        </ListItem>
        <ListItem key="Transfer">
            <Transfer execute={executeTransfer} />
        </ListItem>
        <ListItem key="Approve">
            <Approve execute={executeApprove} />
        </ListItem>
        <ListItem key="TransferFrom">
            <TransferFrom execute={executeTransferFrom} />
        </ListItem>
        <ListItem key="IncreaseAllowance">
            <IncreaseAllowance execute={executeIncreaseAllowance} />
        </ListItem>
        <ListItem key="DecreaseAllowance">
            <DecreaseAllowance execute={executeDecreaseAllowance} />
        </ListItem>
        <ListItem key="Decimals">
            <Decimals execute={executeDecimals} />
        </ListItem>
        <ListItem key="Symbol">
            <Symbol execute={executeSymbol} />
        </ListItem>
        <ListItem key="Name">
            <Name execute={executeName} />
        </ListItem>
    </List>
}

interface totalSupplyProps {
    execute: () => Promise<string>
}

function TotalSupply(props: totalSupplyProps) {
    const [output, setOutput] = useState<string>("")
    return <Paper>
        <Typography variant="h5">TotalSupply</Typography>
        <List>
            <ListItem key="button">
                <Button variant="contained" color="secondary" onClick={async () => { const x = await props.execute(); setOutput(x.toString()) }}>Execute</Button>
            </ListItem>
            <ListItem key="output">
                {output}
            </ListItem>
        </List>
    </Paper>
}

interface balanceOfProps {
    execute: (address: string) => Promise<string>
}

function BalanceOf(props: balanceOfProps) {
    const [output, setOutput] = useState<string>("")
    const [address, setAddress] = useState<string>("")
    return <Paper>
        <Typography variant="h5">Balance Of</Typography>
        <List>
            <ListItem key="account">
                <ValueTextBox placeholder="Account" changeText={setAddress} text={address} />
            </ListItem>
            <ListItem key="button">
                <Button variant="contained" color="secondary" onClick={async () => { const x = await props.execute(address); setOutput(x.toString()) }}>Execute</Button>
            </ListItem>
            <ListItem key="output">
                {output}
            </ListItem>
        </List>
    </Paper>
}

interface allowanceProps {
    execute: (owner: string, spender: string) => Promise<string>
}

function Allowance(props: allowanceProps) {
    const [output, setOutput] = useState<string>("")
    const [owner, setOwner] = useState<string>("")
    const [spender, setSpender] = useState<string>("")
    return <Paper>
        <Typography variant="h5">Allowance</Typography>
        <List>
            <ListItem key="owner">
                <ValueTextBox placeholder="Owner" changeText={setOwner} text={owner} />
            </ListItem>
            <ListItem key="spender">
                <ValueTextBox placeholder="Spender" changeText={setSpender} text={spender} />
            </ListItem>
            <ListItem key="button">
                <Button variant="contained" color="secondary" onClick={async () => { const x = await props.execute(owner, spender); setOutput(x.toString()) }}>Execute</Button>
            </ListItem>
            <ListItem key="output">
                {output}
            </ListItem>
        </List>
    </Paper>
}

interface transferProps {
    execute: (to: string, value: string) => Promise<void>
}

function Transfer(props: transferProps) {
    const [to, setTo] = useState<string>("")
    const [value, setValue] = useState<string>("")

    return <Paper>
        <Typography variant="h5">Transfer</Typography>
        <List>
            <ListItem key="to">
                <ValueTextBox placeholder="To" changeText={setTo} text={to} />
            </ListItem>
            <ListItem key="value">
                <ValueTextBox placeholder="Value" changeText={setValue} text={value} />
            </ListItem>
            <ListItem key="button">
                <Button variant="contained" color="secondary" onClick={async () => await props.execute(to, value)}>Execute</Button>
            </ListItem>
        </List>
    </Paper>
}

interface approveProps {
    execute: (spender: string, value: string) => Promise<void>
}

function Approve(props: approveProps) {
    const [spender, setSpender] = useState<string>("")
    const [value, setValue] = useState<string>("")

    return <Paper>
        <Typography variant="h5">Approve</Typography>
        <List>
            <ListItem key="Spender">
                <ValueTextBox placeholder="Spender" changeText={setSpender} text={spender} />
            </ListItem>
            <ListItem key="value">
                <ValueTextBox placeholder="Value" changeText={setValue} text={value} />
            </ListItem>
            <ListItem key="button">
                <Button variant="contained" color="secondary" onClick={async () => await props.execute(spender, value)}>Execute</Button>
            </ListItem>
        </List>
    </Paper>
}

interface transferFromProps {
    execute: (from: string, to: string, value: string) => Promise<void>
}

function TransferFrom(props: transferFromProps) {
    const [from, setFrom] = useState<string>("")
    const [to, setTo] = useState<string>("")
    const [value, setValue] = useState<string>("")

    return <Paper>
        <Typography variant="h5">Transfer From</Typography>
        <List>
            <ListItem key="from">
                <ValueTextBox placeholder="From" changeText={setFrom} text={from} />
            </ListItem>
            <ListItem key="to">
                <ValueTextBox placeholder="To" changeText={setTo} text={to} />
            </ListItem>
            <ListItem key="value">
                <ValueTextBox placeholder="Value" changeText={setValue} text={value} />
            </ListItem>
            <ListItem key="button">
                <Button variant="contained" color="secondary" onClick={async () => await props.execute(from, to, value)}>Execute</Button>
            </ListItem>
        </List>
    </Paper>
}


interface increaseAllowanceProps {
    execute: (spender: string, addedValue: string) => Promise<void>
}

function IncreaseAllowance(props: increaseAllowanceProps) {
    const [spender, setSpender] = useState<string>("")
    const [addedValue, setAddedValue] = useState<string>("")

    return <Paper>
        <Typography variant="h5">Increase Allowance</Typography>
        <List>
            <ListItem key="spender">
                <ValueTextBox placeholder="Spender" changeText={setSpender} text={spender} />
            </ListItem>
            <ListItem key="addedValue">
                <ValueTextBox placeholder="Added Value" changeText={setAddedValue} text={addedValue} />
            </ListItem>
            <ListItem key="button">
                <Button variant="contained" color="secondary" onClick={async () => await props.execute(spender, addedValue)}>Execute</Button>
            </ListItem>
        </List>
    </Paper>
}


interface decreaseAllowanceProps {
    execute: (spender: string, subtractedValue: string) => Promise<void>
}

function DecreaseAllowance(props: decreaseAllowanceProps) {
    const [spender, setSpender] = useState<string>("")
    const [subtractedValue, setSubtractedValue] = useState<string>("")

    return <Paper>
        <Typography variant="h5">Decrease Allowance</Typography>
        <List>
            <ListItem key="spender">
                <ValueTextBox placeholder="Spender" changeText={setSpender} text={spender} />
            </ListItem>
            <ListItem key="Subtracted Value">
                <ValueTextBox placeholder="Subtracted Value" changeText={setSubtractedValue} text={subtractedValue} />
            </ListItem>
            <ListItem key="button">
                <Button variant="contained" color="secondary" onClick={async () => await props.execute(spender, subtractedValue)}>Execute</Button>
            </ListItem>
        </List>
    </Paper>
}


interface decimalsProps {
    execute: () => Promise<string>
}

function Decimals(props: decimalsProps) {
    const [output, setOutput] = useState<string>("")

    return <Paper>
        <Typography variant="h5">Decimals</Typography>
        <List>
            <ListItem key="button">
                <Button variant="contained" color="secondary" onClick={async () => { const x = await props.execute(); setOutput(x.toString()) }}>Execute</Button>
            </ListItem>
            <ListItem key="output">
                {output}
            </ListItem>
        </List>
    </Paper>
}


interface symbolProps {
    execute: () => Promise<string>
}

function Symbol(props: symbolProps) {
    const [output, setOutput] = useState<string>("")

    return <Paper>
        <Typography variant="h5">Symbols</Typography>
        <List>
            <ListItem key="button">
                <Button variant="contained" color="secondary" onClick={async () => { const x = await props.execute(); setOutput(x.toString()) }}>Execute</Button>
            </ListItem>
            <ListItem key="output">
                {output}
            </ListItem>
        </List>
    </Paper>
}

interface nameProps {
    execute: () => Promise<string>
}

function Name(props: nameProps) {
    const [output, setOutput] = useState<string>("")

    return <Paper>
        <Typography variant="h5">Name</Typography>
        <List>
            <ListItem key="button">
                <Button variant="contained" color="secondary" onClick={async () => { const x = await props.execute(); setOutput(x.toString()) }}>Execute</Button>
            </ListItem>
            <ListItem key="output">
                {output}
            </ListItem>
        </List>
    </Paper>
}