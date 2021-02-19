import { createStyles, FormControl, Grid, InputLabel, makeStyles, MenuItem, Select, Theme, Typography } from '@material-ui/core'
import * as React from 'react'
import { useContext, useEffect, useState } from 'react'
import eye from '../../../../images/Eye.png'
import { WalletContext } from '../../../Contexts/WalletStatusContext'
import SetSilmaril from "./SetSilmaril"
import Fundage from './Fundage'
import StepSelection from './StepSelection'
export default function Governance() {
    const context = useContext(WalletContext)

    return (
        context.isMelkor ? <DAOSection /> :
            <Grid
                container
                direction="column"
                justify="space-between"
                alignItems="center"
                spacing={2}
            >
                <Grid item>
                    <Typography variant="h4">
                        Behodler Governance
               </Typography>
                </Grid>
                <Grid item>
                    <Typography variant="h6">
                        Eye is the governance token in MorgothDAO. Eye is tradable on Behodler and burns on every trade with a maximum supply of 10 million and declining.
               </Typography>
                </Grid>
                <Grid item>
                    <img src={eye} width={100} />
                </Grid>
                <Grid item>
                    <Typography variant="subtitle1">
                        Voting tokens have the unintended side effect of concentrating governance power into the hands of whales because of large transaction costs. Eye is used as a token of last resort to adjudicate governance disputes. The governance tokenomics of Eye is similar to Kleros' PNK.
               </Typography>
                </Grid>
                <Grid item>
                    <Typography variant="caption">
                        The MorgothDAO represents a departure from traditional shareholder democracies on Ethereum by dividing the governance functions into constituencies similar to a parliamentary system.
                        Following the cautious path of gradual decentralization pioneered by Cryptokitties, MorgothDAO formalizes the process of gradually decentralizing all power until any remaining central authority is 'cast into the void'.
                        MorgothDAO is inspired by the manner in which Melkor, the archvillain in J.R.R. Tolkien's Silmarion, gradually poured out his power into his minions, weakening his own power while cementing his presence on Arda through distributed governance.
               </Typography>
                </Grid>

            </Grid>
    )
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        formControl: {
            margin: theme.spacing(1),
            minWidth: 120,
        },
        selectEmpty: {
            marginTop: theme.spacing(2),
        },
    }),
);

type acceptableAspects = "Behodler" | "Morgoth" | "Migration" | ""
function DAOSection(props: any) {
    const classes = useStyles()
    const [aspect, setAspect] = useState<acceptableAspects>("")
    const [behodlerContracts, setBehodlerContracts] = useState<string>("")
    const [morgothContracts, setMorgothContracts] = useState<string>("")
    const [migratorContracts, setMigratorContracts] = useState<string>("")
    const [address, setAddress] = useState<string>()
    
    const context = useContext(WalletContext)
    
    useEffect(() => {
        setBehodlerContracts("")
        setMorgothContracts("")
        setMigratorContracts("")
    }, [aspect])

    useEffect(() => {

        if (behodlerContracts !== '') {
            const contracts = context.contracts.behodler
            switch (behodlerContracts) {
                case 'Lachesis1':
                    setAddress(contracts.Lachesis.address)
                    break;
                case 'Scarcity1':
                    setAddress(contracts.Scarcity.address)
                    break;
                case 'Behodler1':
                    setAddress(contracts.Behodler.address)
                    break;
                case 'Behodler2':
                    setAddress(contracts.Behodler2.Behodler2.address)
                    break;
                case 'Lachesis2':
                    setAddress(contracts.Behodler2.Lachesis.address)
                    break;
                case 'LiquidityReceiver':
                    setAddress(contracts.Behodler2.LiquidityReceiver.address)
                    break;
            }
        } else if (morgothContracts != '') {
            const contracts = context.contracts.behodler.Behodler2.Morgoth
            switch (morgothContracts) {
                case "Angband":
                    setAddress(contracts.Angband.address)
                    break;
                case "IronCrown":
                    setAddress(contracts.IronCrown.address)
                    break;
                case "PowersRegistry":
                    setAddress(contracts.PowersRegistry.address)
                    break;
                case "ScarcityBridge":
                    setAddress(contracts.ScarcityBridge.address)
                    break;
                case "Migrator":
                    setAddress(contracts.Migrator.address)
                    break;
            }
        }
        else if (migratorContracts !== '') {
            const contracts = context.contracts.behodler.Behodler2.Morgoth
            switch (migratorContracts) {
                case "ScarcityBridge":
                    setAddress(contracts.ScarcityBridge.address)
                    break;
                case "Migrator":
                    setAddress(contracts.Migrator.address)
                    break;
            }
        }
    }, [behodlerContracts, morgothContracts, migratorContracts])
    return <Grid
        container
        direction="column"
        justify="space-around"
        alignItems="center"
        spacing={4}
    ><Grid item>
            <Grid
                container
                direction="row"
                justify="space-around"
                alignItems="center"
            >
                <Grid item>
                    <FormControl className={classes.formControl}>
                        <InputLabel id="aspectSelection">Section</InputLabel>
                        <Select
                            labelId="daspectSelection"
                            value={aspect}
                            onChange={event => setAspect(event.target.value as acceptableAspects)}
                        >
                            <MenuItem value={""}>SELECT</MenuItem>
                            <MenuItem value={"Behodler"}>Behodler</MenuItem>
                            <MenuItem value={"Morgoth"}>Morgoth</MenuItem>
                            <MenuItem value={"Migration"}>Migration</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item>
                    <div>
                        <ContractsLive aspect={aspect}
                            behodler={behodlerContracts}
                            setBehodler={setBehodlerContracts}
                            morgoth={morgothContracts}
                            setMorgoth={setMorgothContracts}
                            migrator={migratorContracts}
                            setMigrator={setMigratorContracts} />
                    </div>
                </Grid>
            </Grid>
        </Grid>
        <Grid item>
            {address}
        </Grid>
        <Grid item>
            <StepSelection />
        </Grid>
        <Grid item>
            <Fundage />
        </Grid>
        <Grid item>
            <SetSilmaril />
        </Grid>
    </Grid>
}


function ContractsLive(props: { aspect: acceptableAspects, behodler: string, setBehodler: (c: string) => void, morgoth: string, setMorgoth: (c: string) => void, migrator: string, setMigrator: (c: string) => void }) {
    const classes = useStyles()

    switch (props.aspect) {
        case 'Behodler':
            return <FormControl className={classes.formControl}>
                <InputLabel id="aspectSelection">Section</InputLabel>
                <Select
                    labelId="daspectSelection"
                    value={props.behodler}
                    onChange={event => props.setBehodler(event.target.value as string)}
                >
                    <MenuItem value={""}>SELECT</MenuItem>
                    <MenuItem value={"Lachesis1"}>Lachesis1</MenuItem>
                    <MenuItem value={"Scarcity1"}>Scarcity1</MenuItem>
                    <MenuItem value={"Behodler1"}>Behodler1</MenuItem>
                    <MenuItem value={"Lachesis2"}>Lachesis2</MenuItem>
                    <MenuItem value={"Behodler2"}>Behodler2</MenuItem>
                    <MenuItem value={"LiquidityReceiver"}>LiquidityReceiver</MenuItem>
                </Select>
            </FormControl>
        case 'Migration':
            return <FormControl className={classes.formControl}>
                <InputLabel id="aspectSelection">Section</InputLabel>
                <Select
                    labelId="daspectSelection"
                    value={props.morgoth}
                    onChange={event => props.setMorgoth(event.target.value as string)}
                >
                    <MenuItem value={""}>SELECT</MenuItem>
                    <MenuItem value={"Migrator"}>Migrator</MenuItem>
                    <MenuItem value={"ScarcityBridge"}>Scarcity Bridge</MenuItem>
                </Select>
            </FormControl>
        case 'Morgoth':
            return <FormControl className={classes.formControl}>
                <InputLabel id="aspectSelection">Section</InputLabel>
                <Select
                    labelId="daspectSelection"
                    value={props.morgoth}
                    onChange={event => props.setMorgoth(event.target.value as string)}
                >
                    <MenuItem value={""}>SELECT</MenuItem>
                    <MenuItem value={"Angband"}>Angband</MenuItem>
                    <MenuItem value={"IronCrown"}>IronCrown</MenuItem>
                    <MenuItem value={"PowersRegistry"}>PowersRegistry</MenuItem>

                </Select>
            </FormControl>
    }
    return <div></div>
}

