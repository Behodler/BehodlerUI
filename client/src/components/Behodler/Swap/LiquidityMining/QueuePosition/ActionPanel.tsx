import { Button, createStyles, Divider, Grid, /*InputAdornment,*/ makeStyles, TextField, Theme, Tooltip } from '@material-ui/core';
// import { AccountCircle } from '@material-ui/icons'',
import React, { useContext, useState } from 'react';
import API from 'src/blockchain/ethereumAPI';
import { WalletContext } from 'src/components/Contexts/WalletStatusContext';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        margin: {
            margin: theme.spacing(1),
        },
        maxButton: {
            alignItems: 'center',
            backgroundColor: 'rgba(240, 240, 255,0.7)',
            border: '0px',
            borderRadius: '12px',
            boxShadow: 'rgb(14 14 44 / 40%) 0px -1px 0px inset',
            color: 'rgb(10, 20, 30)',
            cursor: 'pointer',
            display: 'inline-flex',
            fontFamily: 'inherit',
            fontSize: '12px',
            fontWeight: 600,
            width: 'max-content',
            height: '32px',
            lineHeight: '1',
            letterSpacing: '0.03em',
            '-webkit-box-pack': 'center',
            justifyContent: 'center',
            outline: '0px',
            padding: '0px 16px',
            opacity: 1,
            margin: 10
        },
        gradientButton: {
            margin: '10px',
            fontFamily: '"Arial Black", Gadget, sans-serif',
            fontSize: '15px',
            padding: '10px',
            textAlign: 'center',
            textTransform: 'uppercase',
            transition: '0.5s',
            backgroundSize: '200% auto',
            color: '#FFF',
            boxShadow:'0 0 20px #eee',
            borderRadius: '10px',
            width: '70px',
            cursor: 'pointer',
            display: 'inline-block',
            backgroundImage: 'linear-gradient(to right top, #d16ba5, #c777b9, #ba83ca, #aa8fd8, #9a9ae1, #8aa7ec, #79b3f4, #69bff8, #52cffe, #41dfff, #46eefa, #5ffbf1)',
            '&:hover':{
                boxShadow: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
                margin: '8px 10px 12px',
            }
        }
    }),
)


export default function ActionPanel(props: { inputToken: string }) {
    const classes = useStyles()
    const walletContextProps = useContext(WalletContext)
    const [userBalanceOfInput, setUserBalanceOfInput] = useState<string>('')
    const tokenEffects = API.generateNewEffects(props.inputToken, walletContextProps.account, API.isEth(props.inputToken, walletContextProps.networkName))
    const effect = tokenEffects.balanceOfEffect(walletContextProps.account)
    const subcription = effect.Observable.subscribe(bl => {
        API.fromWei(bl)
        setUserBalanceOfInput(bl)
        return () => {
            effect.cleanup()
            subcription.unsubscribe()
        }
    })

    return <Grid
        container
        direction="column"
        justify="flex-start"
        alignItems="stretch"
        spacing={2}
    >
        <Grid item>
            <InputText inputBalance={userBalanceOfInput} />
        </Grid>
        <Grid item>
            <Grid
                container
                direction="column"
                justify="center"
                alignItems="center"
            >
                <Grid item>
                    <Button variant="contained" color="primary" >Enter Queue</Button>
                </Grid>
            </Grid>
        </Grid>
        <Grid>
            <Divider />
        </Grid>
        <Grid item>
            <JustifiedRowTwoItems left="SCX balance" right="5"></JustifiedRowTwoItems>
        </Grid>
        <Grid item>
            <JustifiedRowTwoItems left="EYE/SCX balance" right="35"></JustifiedRowTwoItems>
        </Grid>
        <Grid item>
            <Tooltip title="Instantly convert your LP to SCX to save on gas" >
                <Grid
                    container
                    direction="column"
                    justify="center"
                    alignItems="center"
                >
                    <Grid item>
                        <Button className={classes.gradientButton} variant="contained" >ZAP</Button>
                    </Grid>
                </Grid>
            </Tooltip>
        </Grid>
    </Grid>
}


interface TableProps {
    children?: any,
    className?: string,
    toolTip?: string,
    left?: any,
    right?: any
}

const useRowStyle = makeStyles({
    rightColumn: {
        fontWeight: 'bold',
    },
})

function JustifiedRowTwoItems(props: TableProps) {
    const classes = useRowStyle()
    const component = <Grid
        container
        direction="row"
        justify="space-between"
        alignItems="center"
        spacing={10}
    >
        <Grid item>
            {props.left}
        </Grid>
        <Grid item className={classes.rightColumn}>
            {props.right}
        </Grid>
    </Grid>
    return props.toolTip ? <Tooltip title={props.toolTip}>{component}</Tooltip> : component
}

function InputText(props: { inputBalance: string }) {
    const classes = useStyles()
    return <div className={classes.margin}>
        <Grid container spacing={1} alignItems="flex-end">
            <Grid item>
                <TextField id="input-with-icon-grid" label="Dai amount to queue" />
            </Grid>
            <Grid item>
                <Button className={classes.maxButton}>Max</Button>
            </Grid>
        </Grid>
    </div>

}