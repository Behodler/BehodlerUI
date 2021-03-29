import * as React from 'react'
import { useEffect, useState } from 'react'
import { Button, Checkbox, CheckboxProps, Container, createStyles, FormControlLabel, Grid, List, ListItem, makeStyles, withStyles } from '@material-ui/core'
import { lightGreen } from '@material-ui/core/colors';




export default function LiquidityMining() {
    const [risksAcknowledged, setRisksAcknowledged] = useState<boolean>(!!localStorage.getItem('risks'))

    // useEffect(() => {
    //     const ack = localStorage.getItem('risks')
    //     setRisksAcknowledged(!!ack)
    // })
    const acknowledge = () => {
        localStorage.setItem('risks', "1")
        setRisksAcknowledged(true)
    }
    return (risksAcknowledged ? <div>staking screen</div> : <AcknowledgmentScreen acknowledge={acknowledge} />)
}


const useAckStyles = makeStyles(theme => createStyles({
    proceedDiv: {
        textAlign: 'center'
    }, proceedButton: {
        borderWidth: '1px',
        borderColor: lightGreen[400],
        borderStyle: 'solid'
    }
}))
const acknowledgements = [
    'I may lose funds without explanation or recourse',
    'The parameters of the Liquid Queue which include queue size, hourly rewards and LP burning may change without warning',
    'The Liquid Queue may cease operation without warning',
    `I have done my own research and understand the cryptoeconomics of the Liquid Queue.
     I also have a fundamental understanding of the various components such as the Uniswap Liquidity Pool token`,
    'I understand the Liquid Queue is perpetual and forgoing participation in the Beta round in no way prevents me from participating in future rounds',
    `I don't blindly click checkboxes in order to access DeFi opportunities`
]

const GreenCheckbox = withStyles({
    root: {
        color: lightGreen[400],
        '&$checked': {
            color: lightGreen[400],
        },
    },
    checked: {},
})((props: CheckboxProps) => <Checkbox color="default" {...props} />);


function AcknowledgmentScreen(props: { acknowledge: () => void }) {
    const [acknowledgementState, setAcknowledgementState] = useState<boolean[]>(acknowledgements.map(a => false))
    const [proceedVisible, setProceedVisible] = useState<boolean>(false)
    const classes = useAckStyles()
    const toggleAcknoledgement = (i: number) => {
        acknowledgementState[i] = !acknowledgementState[i];
        setAcknowledgementState([...acknowledgementState])
    }

    useEffect(() => {
        setProceedVisible(acknowledgementState.filter(a => !a).length === 0)
    })
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
                    Liquid Queue, a novel form of liquidity mining, is currently is an experimental phase. In order to participate in the Beta round, it is essential you acknowledge the following:
                </Grid>
                <Grid item>
                </Grid>
                <Grid item>
                    <List>
                        {acknowledgements.map((a, i) => (
                            <ListItem>
                                <FormControlLabel
                                    control={<GreenCheckbox checked={acknowledgementState[i]} onChange={() => toggleAcknoledgement(i)} />}
                                    label={a}
                                />
                            </ListItem>
                        ))}

                    </List>
                </Grid>
                <div className={classes.proceedDiv}>
                    {proceedVisible ?
                        <Button className={classes.proceedButton} variant="outlined" onClick={() => props.acknowledge()}>Proceed to Liquid Queue</Button>
                        : ''}
                </div>
            </Grid>
        </Container>
    )
}