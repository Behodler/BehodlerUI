import * as React from 'react'
import { useState } from 'react'
import { Checkbox, CheckboxProps, Container, /*createStyles,*/ FormControlLabel, Grid, List, ListItem,/* makeStyles,*/ withStyles } from '@material-ui/core'
import { green } from '@material-ui/core/colors';
// const useStyles = makeStyles(theme => createStyles({
//     column: {
//         width: 500
//     }
// }))


const GreenCheckbox = withStyles({
    root: {
        color: green[400],
        '&$checked': {
            color: green[600],
        },
    },
    checked: {},
})((props: CheckboxProps) => <Checkbox color="default" {...props} />);

export default function LiquidityMining() {
    const [first, setFirst] = useState<boolean>(false)

    // const classes = useStyles()
    return (
        <Container>
            <Grid
                container
                direction="column"
                justify="flex-start"
                alignItems="stretch"
            >
                <Grid item>
                    Liquid Queue, a novelty form of liquidity mining, is currently is an experimental phase.
                </Grid>
                <Grid item>
                    In order to participate in the Beta round, it is essential you acknowledge the following:
                </Grid>
                <Grid item>
                    <List>
                        <ListItem>
                            <FormControlLabel
                                control={<GreenCheckbox checked={first} onChange={() => setFirst(!first)} name="checkedG" />}
                                label="Custom color"
                            />
                        </ListItem>
                    </List>
                </Grid>
            </Grid>
        </Container>
    )

}