import { Grid, Typography } from '@material-ui/core'
import * as React from 'react'
import { useContext } from 'react'
import eye from '../../../../images/Eye.png'
import { WalletContext } from '../../../Contexts/WalletStatusContext'

export default function Governance() {
    const context = useContext(WalletContext)

    return (
        context.primary ? <DAOSection /> :
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

function DAOSection(props: any) {
    return <h1>
        TODO: DAO stuff
    </h1>
}