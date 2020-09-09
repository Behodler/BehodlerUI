import * as React from 'react'
import { useState, useContext, useEffect, useCallback } from 'react'
import TradingBox from './TradingBox/index'
import PyroTokens, { basePyroPair, filterPredicate } from './PyroTokens/index'
import Sisyphus from './Sisyphus/index'
import ScarcityFaucet from './ScarcityFaucet/index'
import { Chip, Grid, Typography} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { WalletContext } from "../../Contexts/WalletStatusContext"
import tokenListJSON from "../../../blockchain/behodlerUI/baseTokens.json"
import API from '../../../blockchain/ethereumAPI'
import { PyroToken } from 'src/blockchain/contractInterfaces/behodler/hephaestus/PyroToken'
import behodlerLogo from '../../../images/behodler/logo.png'

import blueGrey from '@material-ui/core/colors/blueGrey'

export type permittedRoutes = 'swap' | 'pyrotokens' | 'sisyphus' | 'faucet'

interface props {
    connected: boolean
    route: permittedRoutes
    setRouteValue: (v: permittedRoutes) => void
}


const useStyles = makeStyles({
    root: {
        flexGrow: 1,
        marginTop: 50
    },
    tabs: {
        marginBottom: '20px'
    },
    betaRisk: {
        backgroundColor: "rgba(63, 81, 181, 0.8)",
        color: 'rgba(255,240,255,0.8)',
        marginBottom: '20px'

    }, Paper: {
        margin: "50px",
        maxWidth: "1000px",
        padding: "20px",
        backgroundColor: blueGrey['600'],
    },
    Grid: {
        minHeight: "700px",
        with: "100%",

    },
    divider: {
        marginBottom: "20px"
    },
    image: {
        height: "300px"
    },
    behodlerHeading: {

    },
    link: {
        fontStyle: "italic"
    }
});


export default function Swap(props: props) {
    const walletContextProps = useContext(WalletContext)

    const [pyroTokenMapping, setPyroTokenMapping] = useState<basePyroPair[]>([])
    const tokenList: any[] = props.connected ? tokenListJSON[walletContextProps.networkName].filter(filterPredicate) : []
    const primaryOptions = { from: walletContextProps.account }
    const fetchPyroTokenDetails = async (baseToken: string): Promise<basePyroPair> => {
        const pyroAddress = await walletContextProps.contracts.behodler.PyroTokenRegistry.baseTokenMapping(baseToken).call(primaryOptions)
        const token: PyroToken = await API.getPyroToken(pyroAddress, walletContextProps.networkName)
        const name = await token.name().call(primaryOptions)
        return {
            name,
            base: baseToken,
            pyro: pyroAddress
        }
    }

    const pytoTokenPopulator = useCallback(async () => {
        let mapping: basePyroPair[] = []
        for (let i = 0; i < tokenList.length; i++) {
            mapping.push(await fetchPyroTokenDetails(tokenList[i].address))
        }
        setPyroTokenMapping(mapping)
    }, [walletContextProps.networkName])

    useEffect(() => {
        if (props.connected) {
            pytoTokenPopulator()
        }
    }, [props.connected])

    const classes = useStyles();
    const [showChip, setShowChip] = useState<boolean>(false)

    useEffect(() => {
        const lastHide = localStorage.getItem('lastBehodlerHide')
        if (lastHide) {
            const duration = parseInt(lastHide)
            const elapsed = new Date().getTime() - duration
            setShowChip(elapsed > 604800000)//604800000 = 1 week
        } else
            setShowChip(true)
    }, [showChip])

    const handleChange = (event: React.ChangeEvent<{}>, newValue: permittedRoutes) => {
        props.setRouteValue(newValue);
    };

    const hideChip = () => {
        localStorage.setItem('lastBehodlerHide', new Date().getTime().toString())
        setShowChip(false);
    }
    const logoVisible = props.connected

    return <div> <Grid
        container
        direction="column"
        justify="center"
        alignItems="center"
        spacing={2}
        className={classes.root}>
        {showChip && props.connected ? <Grid
            container
            direction="row"
            justify="center"
            alignItems="center"
        ><Grid item>
            </Grid>
            <Grid item>
                <Chip className={classes.betaRisk} label="Behodler is currently in Beta. Use at your own risk." onDelete={hideChip} variant="outlined" />
            </Grid>
        </Grid> : ""}
        {logoVisible ? <Grid item>
            <img src={behodlerLogo} width="300" />
        </Grid> : ""
        }
        <Grid item>
            <Grid
                container
                direction="row"
                justify="center"
                alignItems="center"
            >
                <Grid item>
                    <Typography variant="h4" className={classes.behodlerHeading}>
                        Behodler Liquidity Protocol
            </Typography>
                </Grid>
            </Grid>
        </Grid>
        <Grid item>
            {props.connected ?
                <div>
                    <Tabs
                        value={props.route}
                        onChange={handleChange}
                        indicatorColor="primary"
                        centered
                        className={classes.tabs}
                    >
                        <Tab value='swap' label="Swap" />
                        <Tab value='pyrotokens' label="Pyrotokens" />
                        <Tab value='sisyphus' label="Sisyphus" />
                        <Tab value='faucet' label="Scarcity Faucet" />
                    </Tabs>


                    <RenderScreen value={props.route} tokens={pyroTokenMapping} />
                </div>
                : ""}
        </Grid>
        <Grid item>

        </Grid>
    </Grid>
    </div>
}

function RenderScreen(props: { value: permittedRoutes, tokens: basePyroPair[] }) {
    switch (props.value) {
        case 'swap':
            return <TradingBox />
        case 'pyrotokens':
            if (props.tokens.length > 0)
                return <PyroTokens tokens={props.tokens} />
            return <div></div>
        case 'sisyphus':
            return <Sisyphus />
        case 'faucet':
            return <ScarcityFaucet />
        default:
            return <div>Chronos</div>
    }
}