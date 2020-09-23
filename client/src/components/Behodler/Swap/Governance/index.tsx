import { Grid, Typography } from '@material-ui/core'
import * as React from 'react'
import eye from '../../../../images/eye.png'

export default function Governance() {
    return (
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
                    The EYE token represents a voting share in the upcoming innovative MorgothDAO which will govern all administrative functionality on Behodler.
               </Typography>
            </Grid>
            <Grid item>
                <img src={eye} width={100} />
            </Grid>
            <Grid item>
                <Typography variant="subtitle1">
                    To conserve gas and encourage maximum stakeholder participation, governance will be signaled on Snapshot and enforced by the Aragon Court System.
               </Typography>
            </Grid>
            <Grid item>
                <Typography variant="caption">
                    The MorgothDAO represents a departure from traditional shareholder democracies on Ethereum by dividing the governance functions into contituencies similar to a parliamentary system.
                    Following the cautious path of gradual decentralization pioneered by Cryptokitties, MorgothDAO formalizes the process of gradually decentralizing all power until any remaining central authority is 'cast into the void'.
                    MorgothDAO is inspired by the manner in which Melkor, the archvillain in J.R.R. Tolkien's Silmarion, gradually poured out his power into his minions, weakening his own power while cementing his presence on Arda.
               </Typography>
            </Grid>

        </Grid>
    )
}