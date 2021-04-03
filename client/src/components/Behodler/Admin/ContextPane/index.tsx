/* eslint-disable */
import * as React from 'react'
import { useContext, useState, useEffect } from 'react'
import { Grid, Container, Typography, Button, Paper, makeStyles } from '@material-ui/core'
// import { useState } from 'react'
// import { useTheme, withStyles } from '@material-ui/core/styles';
import Behodler from './ContractContexts/Behodler'
import Bellows from './ContractContexts/Bellows'
import Chronos from './ContractContexts/Chronos'
import Janus from './ContractContexts/Janus'
import Kharon from './ContractContexts/Kharon'
import Lachesis from './ContractContexts/Lachesis'
import Prometheus from './ContractContexts/Prometheus'
import Scarcity from './ContractContexts/Scarcity'
import Weth from './ContractContexts/Weth'
import { WalletContext } from '../../../Contexts/WalletStatusContext'
import { ValueTextBox } from 'src/components/Common/ValueTextBox'

const useStyles = makeStyles({
    contextPaneRoot: {
    }
})

interface contextPaneProps {
    selectedContract: string,
}

function ContextPane(props: contextPaneProps) {

    if (props.selectedContract.length == 0)
        return <div></div>
    const classes = useStyles()
    const walletContextProps = useContext(WalletContext)

    const [currentOwner, setCurrentOwner] = useState<string>("")
    useEffect(() => {
        if (props.selectedContract.toLowerCase() !== 'weth' && props.selectedContract.toLowerCase() !== 'sisyphus' && props.selectedContract.toLowerCase() !== 'faucet')
            walletContextProps.contracts.behodler[props.selectedContract].primary()
                .call()
                .then(account => {
                    setCurrentOwner(account)
                })
    }, [])


    const changeOwner = async () => {
        await walletContextProps.contracts.behodler[props.selectedContract].transferPrimary(currentOwner).send({ from: walletContextProps.account })
    }

    return (
        <Paper className={classes.contextPaneRoot}>
            <Grid
                container
                direction="column"
                justify="center"
                alignItems="center"
                spacing={5}
            >
                <Grid>
                    <Container>
                        <Typography component="h5" variant="h5">{props.selectedContract}</Typography>
                    </Container>
                </Grid>
                <Grid item>
                    <Grid
                        container
                        direction="row"
                        justify="center"
                        alignItems="center"
                        spacing={3}
                    >
                        <Grid item>
                            <ValueTextBox text={currentOwner} placeholder="Owner" changeText={setCurrentOwner} />
                        </Grid>
                        <Grid item><Button color="primary" variant="contained" onClick={changeOwner}>Change</Button></Grid>

                    </Grid>
                </Grid>
                <Grid item>
                    <Container>
                        <ChooseContext contractName={props.selectedContract} />
                    </Container>
                </Grid>
            </Grid>
        </Paper>
    )
}



function ChooseContext(props: { contractName: string }) {
    switch (props.contractName) {
        case "Behodler": return <Behodler />
        case "Bellows": return <Bellows />
        case "Chronos": return <Chronos />
        case "Janus": return <Janus />
        case "Kharon": return <Kharon />
        case "Lachesis": return <Lachesis />
        case "Prometheus": return <Prometheus />
        case "Scarcity": return <Scarcity />
        case "Weth": return <Weth />
    }
    return <div></div>
}


export default ContextPane
