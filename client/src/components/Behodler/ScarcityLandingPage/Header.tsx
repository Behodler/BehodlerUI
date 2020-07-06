import * as React from 'react'
import scarcity from "../../../images/scarcity.png"
import { Grid, Typography } from '@material-ui/core'

interface headerProps {

}

export default function Header(props:headerProps) {
    return <Grid
    container
    direction="column"
    justify="flex-end"
    alignItems="center"
    spacing={3}
  >
      <Grid item>
            <img src ={scarcity} width={256} />
      </Grid>
      <Grid item>
          <Typography variant ="h6">
              Scarcity (SCX) is the first Universal Liquidity Token in DeFi 
          </Typography>
      </Grid>
      <Grid item>
          <Typography variant ="subtitle1">
              A universal liquidity token is an ERC20 token that represents the entire liquidity for a decentralized exchange
          </Typography>
      </Grid>
  </Grid>
}