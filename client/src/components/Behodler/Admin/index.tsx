import * as React from 'react'
import { useState } from 'react'
// import { useTheme, withStyles } from '@material-ui/core/styles';
import ContractList from './ContractList/index'
import ContextPane from './ContextPane/index'
import { Grid } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';

interface adminProps {

}

function Admin(props: adminProps) {
    const [ selectedContract, setSelectedContract] = useState<string>("")

    return (
        <Grid
            container
            direction="column"
            justify="space-evenly"
            alignItems="center"
        >
            <Grid item>
                <Typography variant="h2" gutterBottom>
                    Behodler Admin
                </Typography>
            </Grid>
            <Grid item>
                <Grid
                    container
                    direction="row"
                    justify="space-between"
                    alignItems="stretch"
                    spacing={10}
                >
                    <Grid item>
                        <Typography variant="h5" gutterBottom>
                            <ContractList selectContract={setSelectedContract} />
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Typography variant="h5" gutterBottom>
                            <ContextPane selectedContract={selectedContract} />
                        </Typography>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    )
}

export default Admin