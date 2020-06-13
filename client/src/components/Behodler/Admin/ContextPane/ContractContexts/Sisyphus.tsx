import * as React from 'react'
import { useState, useEffect, useCallback } from 'react'
import { useContext } from 'react'
import { WalletContext } from '../../../../Contexts/WalletStatusContext'
import { Paper, Typography, List, ListItem, Button, Checkbox } from '@material-ui/core'
import { ValueTextBox } from 'src/components/Common/ValueTextBox'
// import { address } from 'src/blockchain/contractInterfaces/SolidityTypes'

interface sisyphusProps {

}

export default function Sisyphus(props: sisyphusProps) {
    const walletContextProps = useContext(WalletContext)
    const sisyphus = walletContextProps.contracts.behodler.Sisyphus.Sisyphus
    const primaryOptions = { from: walletContextProps.account }
    const executeEnable = (enabled: boolean) => sisyphus.enable(enabled).send(primaryOptions)
    const executeSetTime = (periodDurationType: string, totalIncrements: string) => sisyphus.setTime(periodDurationType, totalIncrements).send(primaryOptions)
    const executeSetProportion = (proportion: string) => sisyphus.setRewardProportion(proportion).send(primaryOptions)
    const executeSeed = (scx: string, faucet: string) => sisyphus.seed(scx, faucet).send(primaryOptions)
    // const executeSetSponsorToken = (t: string, callback: () => void) => sisyphus.setSponsorToken(t).send(primaryOptions, callback)

    return <List>
        <ListItem key="all props">
            <ListProps />
        </ListItem>
        <ListItem key="Set Enabled">
            <Enable execute={executeEnable} />
        </ListItem>
        <ListItem key="Set time">
            <SetTime execute={executeSetTime} />
        </ListItem>
        <ListItem key="Set Reward Proportion">
            <SetRewardProportion execute={executeSetProportion} />
        </ListItem>
        <ListItem key="Seed">
            <Seed execute={executeSeed} />
        </ListItem>
        {/* <ListItem key="SetSponsorToken">
            <SetSponsorToken execute={executeSetSponsorToken} />
        </ListItem>  */}
    </List>
}

interface ListPropsProps {
}

function ListProps(props: ListPropsProps) {
    const walletContextProps = useContext(WalletContext)
    const [rewardProportion, setRewardProportion] = useState<string>("")
    const [currentMonarch, setCurrentMonarch] = useState<string>("")
    const [scarcity, setScarcity] = useState<string>("")
    const [buyoutAmount, setBuyoutAmount] = useState<string>("")
    const [buyoutTime, setBuyoutTime] = useState<string>("")
    const [periodDuration, setPeriodDuration] = useState<string>("")
    const [totalIncrements, setTotalIncrements] = useState<string>("")
    const [faucet, setFaucet] = useState<string>("")
    const [calculateCurrentBuyout, setCalculateCurrentBuyout] = useState<string>("")

    const sisyphus = walletContextProps.contracts.behodler.Sisyphus.Sisyphus
    const propsCallBack = useCallback(async () => {
        setRewardProportion((await sisyphus.rewardProportion().call()).toString())
        setCurrentMonarch((await sisyphus.currentMonarch().call()).toString())
        setScarcity((await sisyphus.scarcity().call()).toString())
        setBuyoutAmount((await sisyphus.buyoutAmount().call()).toString())
        setBuyoutTime((await sisyphus.buyoutTime().call()).toString())
        setPeriodDuration((await sisyphus.periodDuration().call()).toString())
        setTotalIncrements((await sisyphus.totalIncrements().call()).toString())
        setFaucet((await sisyphus.faucet().call()).toString())
        setCalculateCurrentBuyout((await sisyphus.calculateCurrentBuyout().call()).toString())
    }, [])

    useEffect(() => {
        propsCallBack()
    })

    return <Paper>
        <Typography variant="h5">Props</Typography><List>
            <ListItem key="rew">rewardProportion: {rewardProportion}</ListItem>
            <ListItem key="currentMonarch">currentMonarch: {currentMonarch}</ListItem>
            <ListItem key="scarcity">scarcity: {scarcity}</ListItem>
            <ListItem key="buyoutAmount">buyoutAmount: {buyoutAmount}</ListItem>
            <ListItem key="buyoutTime">buyoutTime: {buyoutTime}</ListItem>
            <ListItem key="periodDuration">periodDuration: {periodDuration}</ListItem>
            <ListItem key="totalIncrements">totalIncrements: {totalIncrements}</ListItem>
            <ListItem key="faucet">faucet: {faucet}</ListItem>
            <ListItem key="calculateCurrentBuyout">calculateCurrentBuyout: {calculateCurrentBuyout}</ListItem>
        </List>
    </Paper>
}


interface enableProps {
    execute: (e: boolean) => Promise<void>
}

function Enable(props: enableProps) {
    const walletContextProps = useContext(WalletContext)
    const [enable, setEnable] = useState<boolean>(false)
    useEffect(() => {
        walletContextProps.contracts.behodler.Sisyphus.Sisyphus.enabled().call({ from: walletContextProps.account })
            .then(result => {
                setEnable(result)
            })
    }, [])

    const handleChangeOfValid = (event) => {
        setEnable(event.target.checked);
    };

    return <Paper>
        <Typography variant="h5">Enable</Typography>
        <List>
            <ListItem key="enable">
                <Checkbox
                    checked={enable}
                    onChange={handleChangeOfValid}
                    inputProps={{ 'aria-label': 'primary checkbox' }}
                />
            </ListItem>
            <ListItem key="button">
                <Button variant="contained" color="secondary" onClick={async () => await props.execute(enable)}>Execute</Button>
            </ListItem>
        </List>
    </Paper>
}

interface setTimeProps {
    execute: (periodDurationType: string, totalIncrements: string) => Promise<void>
}

function SetTime(props: setTimeProps) {
    const walletContextProps = useContext(WalletContext)
    const [duration, setDuration] = useState<string>("")
    const [totalIncrements, setTotalIncrements] = useState<string>("")

    useEffect(() => {
        walletContextProps.contracts.behodler.Sisyphus.Sisyphus.periodDuration().call({ from: walletContextProps.account }).then(d => {
            setDuration(d)
            walletContextProps.contracts.behodler.Sisyphus.Sisyphus.totalIncrements().call({ from: walletContextProps.account }).then(i => {
                setTotalIncrements(i)
            })
        })
    }, [])

    return <Paper>
        <Typography variant="h5">Set Time</Typography>
        <List>
            <ListItem key="duration">
                <ValueTextBox placeholder="duration" changeText={setDuration} text={duration} />
            </ListItem>
            <ListItem key="total Increments">
                <ValueTextBox placeholder="increments" changeText={setTotalIncrements} text={totalIncrements} />
            </ListItem>
            <ListItem key="button">
                <Button variant="contained" color="secondary" onClick={async () => await props.execute(duration, totalIncrements)}>Execute</Button>
            </ListItem>
        </List>
    </Paper>
}


interface setRewardProportionProps {
    execute: (proportion: string) => Promise<void>
}

function SetRewardProportion(props: setRewardProportionProps) {
    const walletContextProps = useContext(WalletContext)
    const [proportion, setProportion] = useState<string>("")

    useEffect(() => {
        walletContextProps.contracts.behodler.Sisyphus.Sisyphus.rewardProportion().call({ from: walletContextProps.account }).then(p => {
            setProportion(p)
        })
    }, [])

    return <Paper>
        <Typography variant="h5">Set Reward Proportion</Typography>
        <List>
            <ListItem key="proportion">
                <ValueTextBox placeholder="proportion" changeText={setProportion} text={proportion} />
            </ListItem>
            <ListItem key="button">
                <Button variant="contained" color="secondary" onClick={async () => await props.execute(proportion)}>Execute</Button>
            </ListItem>
        </List>
    </Paper>
}

interface seedProps {
    execute: (scx: string, faucet: string) => Promise<void>
}

function Seed(props: seedProps) {
    const walletContextProps = useContext(WalletContext)
    const [scx, setScx] = useState<string>("")
    const [faucet, setFaucet] = useState<string>("")

    useEffect(() => {
        walletContextProps.contracts.behodler.Sisyphus.Sisyphus.scarcity().call({ from: walletContextProps.account }).then(s => {
            setScx(s)
        })
    }, [])

    useEffect(() => {
        walletContextProps.contracts.behodler.Sisyphus.Sisyphus.faucet().call({ from: walletContextProps.account }).then(s => {
            setFaucet(s)
        })
    }, [])

    return <Paper>
        <Typography variant="h5">Seed</Typography>
        <List>
            <ListItem key="scx">
                <ValueTextBox placeholder="scx" changeText={setScx} text={scx} />
            </ListItem>
            <ListItem key="faucet">
                <ValueTextBox placeholder="faucet" changeText={setFaucet} text={faucet} />
            </ListItem>
            <ListItem key="button">
                <Button variant="contained" color="secondary" onClick={async () => await props.execute(scx, faucet)}>Execute</Button>
            </ListItem>
        </List>
    </Paper>
}

// interface setSponsorTokenProps {
//     execute: (t: address, callback: () => any) => Promise<void>
// }

// function SetSponsorToken(props: setSponsorTokenProps) {
//     const walletContextProps = useContext(WalletContext)
//     const [sponsorToken, setSponsorToken] = useState<string>("")
//     const [refreshSponsorClicked, setRefreshSponsorClicked] = useState<boolean>(true)
//     const [newSponsorToken, setNewSponsorToken] = useState<string>("")
//     const primaryOptions = { from: walletContextProps.account }

//     const executeRefresh = React.useCallback(async () => {
//         if (refreshSponsorClicked) {
//             setSponsorToken(await walletContextProps.contracts.behodler.Sisyphus.Sisyphus.sponsorToken().call(primaryOptions))
//         }
//     }, [refreshSponsorClicked])

//     useEffect(() => {
//         executeRefresh()
//     }, [executeRefresh])


//     return <Paper>
//         <Typography variant="h5">Set Sponsor Token</Typography>
//         <Typography variant="h6">Current Sponsor Token: {sponsorToken}</Typography>
//         <List>
//             <ListItem key="sponsorToken">
//                 <ValueTextBox placeholder="new sponsor token" changeText={setNewSponsorToken} text={newSponsorToken} />
//             </ListItem>
//             <ListItem key="button">
//                 <Button variant="contained" color="secondary" onClick={async () => await props.execute(newSponsorToken, () => setRefreshSponsorClicked(true))}>Execute</Button>
//             </ListItem>
//         </List>
//     </Paper>

// }