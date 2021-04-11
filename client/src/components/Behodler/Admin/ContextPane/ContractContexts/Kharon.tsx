import * as React from 'react'
import { useState, useEffect } from 'react'
import { useContext } from 'react'
import { WalletContext } from '../../../../Contexts/WalletStatusContext'
import { Paper, Typography, List, ListItem, Button } from '@material-ui/core'
import { ValueTextBox } from 'src/components/Common/ValueTextBox'
import API from 'src/blockchain/ethereumAPI'

interface kharonProps {

}

export default function Kharon(props: kharonProps) {
    const walletContextProps = useContext(WalletContext)
    const primaryOptions = { from: walletContextProps.account }
    const executeSeed = async (bellows: string, behodler: string, prometheus: string, pre: string, weiDaiBank: string, dai: string, weidai: string, scar: string, cut: string, donationAddress: string) => walletContextProps.contracts.behodler.Kharon.seed(bellows, behodler, prometheus, pre, weiDaiBank, dai, weidai, scar, cut, donationAddress).send(primaryOptions)
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
        <ListItem key="donations">
            <Donations />
        </ListItem>
        <ListItem key="WithDrawDonations">
            <WithDrawDonations execute={executeWithDrawDonations} />
        </ListItem>
    </List>
}

interface donationsProps {
}

function Donations(props: donationsProps) {
    const walletContextProps = useContext(WalletContext)
    const [oxt, setOXT] = useState<string>("")
    const [pnk, setPNK] = useState<string>("")
    const [weth, setWeth] = useState<string>("")
    const [link, setLink] = useState<string>("")
    const [loom, setLoom] = useState<string>("")
    const [wbtc, setWBTC] = useState<string>("")
    const [mkr, setMKR] = useState<string>("")
    const [bat, setBAT] = useState<string>("")



    useEffect(() => {
        const currentTokenEffects = API.generateNewEffects('0x4575f41308ec1483f3d399aa9a2826d74da13deb', walletContextProps.account, false, 18)
        const effect = currentTokenEffects.balanceOfTokenEffect(walletContextProps.contracts.behodler.Kharon.address)
        const subscription = effect.Observable.subscribe(balance => {
            setOXT(balance)
        })

        return () => { subscription.unsubscribe();  }
    })

    useEffect(() => {
        const currentTokenEffects = API.generateNewEffects('0x93ed3fbe21207ec2e8f2d3c3de6e058cb73bc04d', walletContextProps.account, false, 18)
        const effect = currentTokenEffects.balanceOfTokenEffect(walletContextProps.contracts.behodler.Kharon.address)
        const subscription = effect.Observable.subscribe(balance => {
            setPNK(balance)
        })

        return () => { subscription.unsubscribe();  }
    })


    useEffect(() => {
        const currentTokenEffects = API.generateNewEffects('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', walletContextProps.account, false, 18)
        const effect = currentTokenEffects.balanceOfTokenEffect(walletContextProps.contracts.behodler.Kharon.address)
        const subscription = effect.Observable.subscribe(balance => {
            setWeth(balance)
        })

        return () => { subscription.unsubscribe();  }
    })


    useEffect(() => {
        const currentTokenEffects = API.generateNewEffects('0x514910771af9ca656af840dff83e8264ecf986ca', walletContextProps.account, false, 18)
        const effect = currentTokenEffects.balanceOfTokenEffect(walletContextProps.contracts.behodler.Kharon.address)
        const subscription = effect.Observable.subscribe(balance => {
            setLink(balance)
        })

        return () => { subscription.unsubscribe();  }
    })


    useEffect(() => {
        const currentTokenEffects = API.generateNewEffects('0xa4e8c3ec456107ea67d3075bf9e3df3a75823db0', walletContextProps.account, false, 18)
        const effect = currentTokenEffects.balanceOfTokenEffect(walletContextProps.contracts.behodler.Kharon.address)
        const subscription = effect.Observable.subscribe(balance => {
            setLoom(balance)
        })

        return () => { subscription.unsubscribe();  }
    })


    useEffect(() => {
        const currentTokenEffects = API.generateNewEffects('0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', walletContextProps.account, false, 8)
        const effect = currentTokenEffects.balanceOfTokenEffect(walletContextProps.contracts.behodler.Kharon.address)
        const subscription = effect.Observable.subscribe(balance => {
            setWBTC(balance)
        })

        return () => { subscription.unsubscribe();  }
    })


    useEffect(() => {
        const currentTokenEffects = API.generateNewEffects('0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2', walletContextProps.account, false, 18)
        const effect = currentTokenEffects.balanceOfTokenEffect(walletContextProps.contracts.behodler.Kharon.address)
        const subscription = effect.Observable.subscribe(balance => {
            setMKR(balance)
        })

        return () => { subscription.unsubscribe();  }
    })


    useEffect(() => {
        const currentTokenEffects = API.generateNewEffects('0x0d8775f648430679a709e98d2b0cb6250d2887ef', walletContextProps.account, false, 18)
        const effect = currentTokenEffects.balanceOfTokenEffect(walletContextProps.contracts.behodler.Kharon.address)
        const subscription = effect.Observable.subscribe(balance => {
            setBAT(balance)
        })

        return () => { subscription.unsubscribe();  }
    })

    return <Paper>
        <Typography variant="h5">Balances</Typography>
        <List>
            <ListItem>
                <ListItem key="oxt">OXT: {oxt}</ListItem>
                <ListItem key="pnk">PNK: {pnk}</ListItem>
                <ListItem key="weth">Weth: {weth}</ListItem>
                <ListItem key="link">LINK: {link}</ListItem>
                <ListItem key="loom">LOOM: {loom}</ListItem>
                <ListItem key="wbtc">WBTC: {wbtc}</ListItem>
                <ListItem key="mkr">MKR: {mkr}</ListItem>
                <ListItem key="bat">BAT: {bat}</ListItem>
            </ListItem>
        </List>
    </Paper>
}


interface seedProps {
    execute: (bellows: string, behodler: string, prometheus: string, pre: string, weiDaiBank: string, dai: string, weidai: string, scar: string, cut: string, donationAddress: string) => Promise<void>
}

function Seed(props: seedProps) {
    const [bellows, setBellows] = useState<string>("")
    const [behodler, setBehodler] = useState<string>("")
    const [pre, setPre] = useState<string>("")
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
            <ListItem key="PRE">
                <ValueTextBox text={pre} placeholder="PRE" changeText={setPre} />
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
                <Button variant="contained" color="secondary" onClick={async () => await props.execute(bellows, behodler, prometheus, pre, weiDaiBank, dai, weiDai, scx, cut, donation)}>Execute</Button>
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
