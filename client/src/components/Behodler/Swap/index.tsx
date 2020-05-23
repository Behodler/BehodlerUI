import * as React from 'react'
import { useState, useContext, useEffect, useCallback } from 'react'
import TradingBox from './TradingBox/index'
import PyroTokens, { basePyroPair, filterPredicate } from './PyroTokens/index'
import Sisyphus from './Sisyphus/index'
import ScarcityFaucet from './ScarcityFaucet/index'
import { Container, Chip, Grid } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { WalletContext } from "../../Contexts/WalletStatusContext"
import tokenListJSON from "../../../blockchain/behodlerUI/baseTokens.json"
import API from '../../../blockchain/ethereumAPI'
import { PyroToken } from 'src/blockchain/contractInterfaces/behodler/hephaestus/PyroToken'

interface props {

}

const useStyles = makeStyles({
    root: {
        flexGrow: 1,
    },
    tabs: {
        marginBottom: '20px'
    }, betaRisk: {
        backgroundColor: "rgba(63, 81, 181, 0.8)",
        color: 'rgba(255,240,255,0.8)',
        marginBottom: '20px'

    }
});


export default function Swap(props: props) {

    const walletContextProps = useContext(WalletContext)
    const [pyroTokenMapping, setPyroTokenMapping] = useState<basePyroPair[]>([])
    const tokenList: any[] = tokenListJSON[walletContextProps.networkName].filter(filterPredicate)
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
        pytoTokenPopulator()
    }, [])

    const classes = useStyles();
    const [value, setValue] = useState(0);
    const [showChip, setShowChip] = useState<boolean>(true)

    const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
        setValue(newValue);
    };

    const hideChip = () => setShowChip(false)

    return <Container className={classes.root}>
        {showChip ? <Grid
            container
            direction="row"
            justify="center"
            alignItems="center"
        ><Grid item>
                <Chip className={classes.betaRisk} label="This section is in beta. Use at your own risk." onDelete={hideChip} variant="outlined" />
            </Grid>
        </Grid> : ""}

        <Tabs
            value={value}
            onChange={handleChange}
            indicatorColor="primary"
            centered
            className={classes.tabs}
        >
            <Tab label="Swap" />
            <Tab label="Pyrotokens" />
            <Tab label="Sisyphus" />
            <Tab label="Scarcity Faucet" />
        </Tabs>
        <RenderScreen value={value} tokens={pyroTokenMapping} />
    </Container>
}

function RenderScreen(props: { value: number, tokens: basePyroPair[] }) {
    switch (props.value) {
        case 0:
            return <TradingBox />
        case 1:
            if (props.tokens.length > 0)
                return <PyroTokens tokens={props.tokens} />
            return <div></div>
        case 2:
            return <Sisyphus />
        case 3:
            return <ScarcityFaucet />
        default:
            return <div>Chronos</div>
    }
}