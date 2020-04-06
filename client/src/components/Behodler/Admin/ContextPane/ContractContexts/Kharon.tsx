import * as React from 'react'
import { useState } from 'react'
import { useContext } from 'react'
import { WalletContext } from '../../../../Contexts/WalletStatusContext'
import { Paper, Typography, List, ListItem, Button } from '@material-ui/core'
import { ValueTextBox } from 'src/components/Common/ValueTextBox'

interface kharonProps {

}

export default function Kharon(props: kharonProps) {
    const walletContextProps = useContext(WalletContext)
    const primaryOptions = { from: walletContextProps.account }
    const executeSeed = async (bellows: string, behodler: string, prometheus: string, weiDaiBank: string, dai: string, weidai: string, scar: string, cut: string, donationAddress: string) => walletContextProps.contracts.behodler.Kharon.seed(bellows, behodler, prometheus, weiDaiBank, dai, weidai, scar, cut, donationAddress).send(primaryOptions)
    const executeSetTollRate = async (toll: string) => walletContextProps.contracts.behodler.Kharon.setTollRate(toll).send(primaryOptions)
    const executeToll = async (token: string, value: string) => walletContextProps.contracts.behodler.Kharon.toll(token, value).call(primaryOptions)
    const executeWithDrawDonations = async (token: string) => walletContextProps.contracts.behodler.Kharon.withdrawDonations(token).send(primaryOptions)

    return <List>
        <ListItem key="seed">
            <Seed execute={executeSeed} />
        </ListItem>
        <ListItem key="setTollRate">
            <SetTollRate execute={executeSetTollRate} />
        </ListItem>
        <ListItem key="toll">
            <Toll execute={executeToll} />
        </ListItem>
        <ListItem key="WithDrawDonations">
            <WithDrawDonations execute={executeWithDrawDonations} />
        </ListItem>
    </List>
}


interface seedProps {
    execute: (bellows: string, behodler: string, prometheus: string, weiDaiBank: string, dai: string, weidai: string, scar: string, cut: string, donationAddress: string) => Promise<void>
}

function Seed(props: seedProps) {
    const [bellows, setBellows] = useState<string>("")
    const [behodler, setBehodler] = useState<string>("")
    const [prometheus, setPrometheus] = useState<string>("")
    const [weiDaiBank, setWeiDaiBank] = useState<string>("")
    const [dai, setDai] = useState<string>("")
    const [weiDai, setWeiDai] = useState<string>("")
    const [scx, setScx] = useState<string>("")
    const [cut, setCut] = useState<string>("")
    const [donation, setDonation] = useState<string>("")

    return <Paper>
        <Typography variant="h5">Seed</Typography>
        <List>
            <ListItem key="bellows">
                <ValueTextBox text={bellows} placeholder="Bellows" changeText={setBellows} />
            </ListItem>
            <ListItem key="behodler">
                <ValueTextBox text={behodler} placeholder="Behodler" changeText={setBehodler} />
            </ListItem>
            <ListItem key="prometheus">
                <ValueTextBox text={prometheus} placeholder="prometheus" changeText={setPrometheus} />
            </ListItem>
            <ListItem key="weiDaiBank">
                <ValueTextBox text={weiDaiBank} placeholder="WeiDaiBank" changeText={setWeiDaiBank} />
            </ListItem>
            <ListItem key="dai">
                <ValueTextBox text={dai} placeholder="Dai" changeText={setDai} />
            </ListItem>
            <ListItem key="weiDai">
                <ValueTextBox text={weiDai} placeholder="WeiDai" changeText={setWeiDai} />
            </ListItem>
            <ListItem key="SCX">
                <ValueTextBox text={scx} placeholder="Scarcity" changeText={setScx} />
            </ListItem>
            <ListItem key="cut">
                <ValueTextBox text={cut} placeholder="Cut (uint)" changeText={setCut} />
            </ListItem>
            <ListItem key="donationAddress">
                <ValueTextBox text={donation} placeholder="Donation Account" changeText={setDonation} />
            </ListItem>
            <ListItem>
                <Button variant="contained" color="secondary" onClick={async () => await props.execute(bellows, behodler, prometheus, weiDaiBank, dai, weiDai, scx, cut, donation)}>Execute</Button>
            </ListItem>
        </List>
    </Paper>
}


interface setTollRateProps {
    execute: (toll: string) => Promise<void>
}

function SetTollRate(props: setTollRateProps) {
    const [toll, setToll] = useState<string>("")


    return <Paper>
        <Typography variant="h5">setTollRate</Typography>
        <List>
            <ListItem key="toll">
                <ValueTextBox text={toll} placeholder="Toll (uint)" changeText={setToll} />
            </ListItem>
            <ListItem>
                <Button variant="contained" color="secondary" onClick={async () => await props.execute(toll)}>Execute</Button>
            </ListItem>
        </List>
    </Paper>
}

interface tollProps {
    execute: (token: string, value: string) => Promise<string>
}

function Toll(props: tollProps) {
    const [token, setToken] = useState<string>("")
    const [value, setValue] = useState<string>("")
    const [tollOutput, setTollOutput] = useState<string>("")
    if (3 > 100)
        setTollOutput("33")
    return <Paper>
        <Typography variant="h5">toll</Typography>
        <List>
            <ListItem key="token">
                <ValueTextBox text={token} placeholder="Token Address" changeText={setToken} />
            </ListItem>
            <ListItem key="value">
                <ValueTextBox text={value} placeholder="Value" changeText={setValue} />
            </ListItem>
            <ListItem key="button">
                <Button variant="contained" color="secondary" onClick={async () => { let x = await props.execute(token, value); setTollOutput(x.toString()) }}>Execute</Button>
            </ListItem>
            <ListItem key="output">
                {tollOutput}
            </ListItem>
        </List>
    </Paper>
}

interface withDrawDonationsProps {
    execute: (token: string) => Promise<void>
}

function WithDrawDonations(props: withDrawDonationsProps) {
    const [token, setToken] = useState<string>("")

    return <Paper>
        <Typography variant="h5">withdrawDonations</Typography>
        <List>
            <ListItem key="token">
                <ValueTextBox text={token} placeholder="Token Address" changeText={setToken} />
            </ListItem>
            <ListItem>
                <Button variant="contained" color="secondary" onClick={async () => await props.execute(token)}>Execute</Button>
            </ListItem>
        </List>
    </Paper>
}
