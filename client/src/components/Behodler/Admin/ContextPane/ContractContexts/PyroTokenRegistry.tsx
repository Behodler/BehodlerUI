import * as React from 'react'
import { useState } from 'react'
import { useContext } from 'react'
import { WalletContext } from '../../../../Contexts/WalletStatusContext'
import { Paper, Typography, List, ListItem, Button } from '@material-ui/core'
import { ValueTextBox } from 'src/components/Common/ValueTextBox'

interface pyroTokenRegistryProps {

}

export default function PyroTokenRegistry(props: pyroTokenRegistryProps) {
    const walletContextProps = useContext(WalletContext)
    const primaryOptions = { from: walletContextProps.account }
    const executeSeed = async (bellows: string, lachesis: string, kharon: string) => walletContextProps.contracts.behodler.PyroTokenRegistry.seed(bellows, lachesis, kharon).send(primaryOptions)
    const executeAddToken = async (name: string, symbol: string, baseToken: string) => walletContextProps.contracts.behodler.PyroTokenRegistry.addToken(name, symbol, baseToken).send(primaryOptions)
    const executeBaseTokenMapping = async (base: string) => walletContextProps.contracts.behodler.PyroTokenRegistry.baseTokenMapping(base).call(primaryOptions)
    const executePyroTokenMapping = async (pToken: string) => walletContextProps.contracts.behodler.PyroTokenRegistry.pyroTokenMapping(pToken).call(primaryOptions)

    return <List>
        <ListItem key="seed">
            <Seed execute={executeSeed} />
        </ListItem>
        <ListItem key="AddToken">
            <AddToken execute={executeAddToken} />
        </ListItem>
        <ListItem key="BaseTokenMapping">
            <BaseTokenMapping execute={executeBaseTokenMapping} />
        </ListItem>
        <ListItem key="PyroTokenMapping">
            <PyroTokenMapping execute={executePyroTokenMapping} />
        </ListItem>
    </List>
}


interface seedProps {
    execute: (bellows: string, lachesis: string, kharon: string) => Promise<void>
}

function Seed(props: seedProps) {
    const [bellows, setBellows] = useState<string>("")
    const [lachesis, setLachesis] = useState<string>("")
    const [kharon, setKharon] = useState<string>("")

    return <Paper>
        <Typography variant="h5">Seed</Typography>
        <List>
            <ListItem key="bellows">
                <ValueTextBox text={bellows} placeholder="Bellows" changeText={setBellows} />
            </ListItem>
            <ListItem key="lachesis">
                <ValueTextBox text={lachesis} placeholder="Lachesis" changeText={setLachesis} />
            </ListItem>
            <ListItem key="kharon">
                <ValueTextBox text={kharon} placeholder="Kharon" changeText={setKharon} />
            </ListItem>
            <ListItem>
                <Button variant="contained" color="secondary" onClick={async () => await props.execute(bellows, lachesis, kharon)}>Execute</Button>
            </ListItem>
        </List>
    </Paper>
}

interface addTokenProps {
    execute: (name: string, symbol: string, baseToken: string) => Promise<void>
}

function AddToken(props: addTokenProps) {
    const [name, setName] = useState<string>("")
    const [symbol, setSymbol] = useState<string>("")
    const [baseToken, setBaseToken] = useState<string>("")

    return <Paper>
        <Typography variant="h5">AddToken</Typography>
        <List>
            <ListItem key="Name">
                <ValueTextBox text={name} placeholder="Name" changeText={setName} />
            </ListItem>
            <ListItem key="Symbol">
                <ValueTextBox text={symbol} placeholder="Symbol" changeText={setSymbol} />
            </ListItem>
            <ListItem key="Base">
                <ValueTextBox text={baseToken} placeholder="BaseToken" changeText={setBaseToken} />
            </ListItem>
            <ListItem>
                <Button variant="contained" color="secondary" onClick={async () => await props.execute(name, symbol, baseToken)}>Execute</Button>
            </ListItem>
        </List>
    </Paper>
}

interface baseTokenMappingProps {
    execute: (base: string) => Promise<string>
}

function BaseTokenMapping(props: baseTokenMappingProps) {
    const [base, setBase] = useState<string>("")
    const [output, setOutput] = useState<string>("")

    return <Paper>
        <Typography variant="h5">BaseTokenMapping</Typography>
        <List>
            <ListItem key="BaseToken">
                <ValueTextBox text={base} placeholder="Base Token" changeText={setBase} />
            </ListItem>
            <ListItem>
                <Button variant="contained" color="secondary" onClick={async () => { const x = await props.execute(base); setOutput(x.toString()) }}>Execute</Button>
            </ListItem>
            <ListItem key="Output">
                PyroToken: {output}
            </ListItem>
        </List>
    </Paper>
}


interface pyroTokenMappingProps {
    execute: (pyro: string) => Promise<string>
}

function PyroTokenMapping(props: pyroTokenMappingProps) {
    const [pyro, setPyro] = useState<string>("")
    const [output, setOutput] = useState<string>("")

    return <Paper>
        <Typography variant="h5">PyroTokenMapping</Typography>
        <List>
            <ListItem key="PyroToken">
                <ValueTextBox text={pyro} placeholder="Pyro Token" changeText={setPyro} />
            </ListItem>
            <ListItem>
                <Button variant="contained" color="secondary" onClick={async () => { const x = await props.execute(pyro); setOutput(x.toString()) }}>Execute</Button>
            </ListItem>
            <ListItem key="Output">
                PyroToken: {output}
            </ListItem>
        </List>
    </Paper>
}