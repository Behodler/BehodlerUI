import * as React from 'react'
import { Grid, Container, Typography, TextField, Button, Paper } from '@material-ui/core'
// import { useState } from 'react'
// import { useTheme, withStyles } from '@material-ui/core/styles';
import Behodler from './ContractContexts/Behodler'
import Bellows from './ContractContexts/Bellows'
import Chronos from './ContractContexts/Chronos'
import Janus from './ContractContexts/Janus'
import Kharon from './ContractContexts/Kharon'
import Lachesis from './ContractContexts/Lachesis'
import Prometheus from './ContractContexts/Prometheus'
import PyroTokenRegistry from './ContractContexts/PyroTokenRegistry'
import Scarcity from './ContractContexts/Scarcity'
import Weth from './ContractContexts/Weth'

interface contextPaneProps {
    selectedContract: string
}

function ContextPane(props: contextPaneProps) {
    if (props.selectedContract.length == 0)
        return <div></div>

    return (
        <Paper>
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
                        <Grid item>  <TextField id="filled-helperText" label="Change Owner" defaultValue="0xfdabc123123f" variant="filled" /></Grid>
                        <Grid item><Button color="primary" variant="contained">Change</Button></Grid>

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
        case "PyroTokenRegistry": return <PyroTokenRegistry />
        case "Scarcity": return <Scarcity />
        case "Weth": return <Weth />
    }
    return <div></div>
}


export default ContextPane