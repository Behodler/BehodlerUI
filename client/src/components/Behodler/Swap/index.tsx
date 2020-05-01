import * as React from 'react'
import { useState } from 'react'
import TradingBox from './TradingBox/index'
import PyroTokens from './PyroTokens/index'
import { Container, Chip, Grid } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

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
            <Tab label="Chronos" />
        </Tabs>
        <RenderScreen value={value} />
    </Container>
}

function RenderScreen(props: { value: number }) {
    switch (props.value) {
        case 0:
            return <TradingBox />
        case 1:
            return <PyroTokens />
        default:
            return <div>Chronos</div>
    }
}