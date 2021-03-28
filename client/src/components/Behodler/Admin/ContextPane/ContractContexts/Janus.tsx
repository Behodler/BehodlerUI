import * as React from 'react'
import { useState } from 'react'
import { useContext } from 'react'
import { WalletContext } from '../../../../Contexts/WalletStatusContext'
import { Paper, Typography, List, ListItem, Button } from '@material-ui/core'
import { ValueTextBox } from '../../../../Common/ValueTextBox'

interface janusProps {}

export default function Janus(props: janusProps) {
    const walletContextProps = useContext(WalletContext)
    const primaryOptions = { from: walletContextProps.account }
    const executeSeed = async (scx: string, weth: string, behodler: string) => walletContextProps.contracts.behodler.Janus.seed(scx, weth, behodler).send(primaryOptions)
    const executeTokenToToken = async (input: string, output: string, value: string, minPrice: string, maxPrice: string) =>
        walletContextProps.contracts.behodler.Janus.tokenToToken(input, output, value, minPrice, maxPrice).send(primaryOptions)
    const executeEthToToken = async (output: string, minPrice: string, maxPrice: string) =>
        walletContextProps.contracts.behodler.Janus.ethToToken(output, minPrice, maxPrice).send(primaryOptions)
    const executeTokenToEth = async (input: string, value: string, minPrice: string, maxPrice: string) =>
        walletContextProps.contracts.behodler.Janus.tokenToEth(input, value, minPrice, maxPrice).send(primaryOptions)

    return (
        <List>
            <ListItem key="seed">
                <Seed execute={executeSeed} />
            </ListItem>
            <ListItem key="tokenToToken">
                <TokenToToken execute={executeTokenToToken} />
            </ListItem>
            <ListItem key="ethToToken">
                <EthToToken execute={executeEthToToken} />
            </ListItem>
            <ListItem key="tokenToEth">
                <TokenToEth execute={executeTokenToEth} />
            </ListItem>
        </List>
    )
}

interface seedProps {
    execute: (scx: string, weth: string, behodler: string) => Promise<void>
}

function Seed(props: seedProps) {
    const [scx, setScx] = useState<string>('')
    const [weth, setWeth] = useState<string>('')
    const [behodler, setBehodler] = useState<string>('')

    return (
        <Paper>
            <Typography variant="h5">Seed</Typography>
            <List>
                <ListItem key="scx">
                    <ValueTextBox text={scx} placeholder="SCX" changeText={setScx} />
                </ListItem>
                <ListItem key="weth">
                    <ValueTextBox text={weth} placeholder="Weth" changeText={setWeth} />
                </ListItem>
                <ListItem key="behodler">
                    <ValueTextBox text={behodler} placeholder="Behodler" changeText={setBehodler} />
                </ListItem>
                <ListItem>
                    <Button variant="contained" color="secondary" onClick={async () => await props.execute(scx, weth, behodler)}>
                        Execute
                    </Button>
                </ListItem>
            </List>
        </Paper>
    )
}

interface tokenToTokenProps {
    execute: (input: string, output: string, value: string, minPrice: string, maxPrice: string) => Promise<void>
}

function TokenToToken(props: tokenToTokenProps) {
    const [input, setInput] = useState<string>('')
    const [output, setOutput] = useState<string>('')
    const [value, setValue] = useState<string>('')
    const [minPrice, setMinPrice] = useState<string>('')
    const [maxPrice, setMaxPrice] = useState<string>('')

    return (
        <Paper>
            <Typography variant="h5">tokenToToken</Typography>
            <List>
                <ListItem key="input">
                    <ValueTextBox text={input} placeholder="Input" changeText={setInput} />
                </ListItem>
                <ListItem key="output">
                    <ValueTextBox text={output} placeholder="Output" changeText={setOutput} />
                </ListItem>
                <ListItem key="value">
                    <ValueTextBox text={value} placeholder="Value" changeText={setValue} />
                </ListItem>
                <ListItem key="minPrice">
                    <ValueTextBox text={minPrice} placeholder="MinPrice" changeText={setMinPrice} />
                </ListItem>
                <ListItem key="maxPrice">
                    <ValueTextBox text={maxPrice} placeholder="MaxPrice" changeText={setMaxPrice} />
                </ListItem>
                <ListItem>
                    <Button variant="contained" color="secondary" onClick={async () => await props.execute(input, output, value, minPrice, maxPrice)}>
                        Execute
                    </Button>
                </ListItem>
            </List>
        </Paper>
    )
}

interface ethToTokenProps {
    execute: (output: string, minPrice: string, maxPrice: string) => Promise<void>
}

function EthToToken(props: ethToTokenProps) {
    const [output, setOutput] = useState<string>('')
    const [minPrice, setMinPrice] = useState<string>('')
    const [maxPrice, setMaxPrice] = useState<string>('')

    return (
        <Paper>
            <Typography variant="h5">ethToToken</Typography>
            <List>
                <ListItem key="output">
                    <ValueTextBox text={output} placeholder="Output" changeText={setOutput} />
                </ListItem>
                <ListItem key="minPrice">
                    <ValueTextBox text={minPrice} placeholder="MinPrice" changeText={setMinPrice} />
                </ListItem>
                <ListItem key="maxPrice">
                    <ValueTextBox text={maxPrice} placeholder="MaxPrice" changeText={setMaxPrice} />
                </ListItem>
                <ListItem>
                    <Button variant="contained" color="secondary" onClick={async () => await props.execute(output, minPrice, maxPrice)}>
                        Execute
                    </Button>
                </ListItem>
            </List>
        </Paper>
    )
}

interface tokenToEthProps {
    execute: (input: string, value: string, minPrice: string, maxPrice: string) => Promise<void>
}

function TokenToEth(props: tokenToEthProps) {
    const [input, setInput] = useState<string>('')
    const [value, setValue] = useState<string>('')
    const [minPrice, setMinPrice] = useState<string>('')
    const [maxPrice, setMaxPrice] = useState<string>('')

    return (
        <Paper>
            <Typography variant="h5">tokenToEth</Typography>
            <List>
                <ListItem key="input">
                    <ValueTextBox text={input} placeholder="Input" changeText={setInput} />
                </ListItem>
                <ListItem key="value">
                    <ValueTextBox text={value} placeholder="Value" changeText={setValue} />
                </ListItem>
                <ListItem key="minPrice">
                    <ValueTextBox text={minPrice} placeholder="MinPrice" changeText={setMinPrice} />
                </ListItem>
                <ListItem key="maxPrice">
                    <ValueTextBox text={maxPrice} placeholder="MaxPrice" changeText={setMaxPrice} />
                </ListItem>
                <ListItem>
                    <Button variant="contained" color="secondary" onClick={async () => await props.execute(input, value, minPrice, maxPrice)}>
                        Execute
                    </Button>
                </ListItem>
            </List>
        </Paper>
    )
}
