import React from 'react';
import { useContext } from 'react'
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles'
import { Grid, Dialog, Container, Link, Button } from '@material-ui/core'
import metamaskAccount from '../../images/behodler/metamaskaccount.png'
import IconCopy from '../../images/behodler/icon_copy.png'
import IconLink from '../../images/behodler/icon_link.png'
import BigNumber from 'bignumber.js'
import { WalletContext } from "../Contexts/WalletStatusContext"
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

declare global {
    interface String {
        fromRAY(): string
        fromWAD(): string
        toWAD(): string
        asPercentage(): string
        truncBig(): string
        dropDecimals(): string
    }
}
String.prototype.truncBig = function (): string {
    const big = new BigNumber(this.toString())
    return big.isNaN() ? this.toString() : big.decimalPlaces(4).toString()
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        dialog: {
            fontSize: theme.typography.subtitle2.fontSize,
            fontFamily: theme.typography.fontFamily,
            overflow: 'hidden',
            padding: '0',
            boxSizing: 'border-box',
            maxWidth: '450px'
        },
        dialogContainer: {
            padding: 0
        },
        accountIcon: {
            border: '2px solid #fff',
            borderRadius: '100%'
        },
        chngAccount: {
            fontSize: '12px',
            fontFamily: theme.typography.fontFamily,
            // color: theme.palette.type == 'dark' ? 'white' : 'black',
            border: '2px solid #5848d5',
            borderRadius: 6,
            padding: '3px 14px 3px 14px',
            backgroundColor: '#fff',
            fontWeight: 600,
            color: '#5848d5',
            '&:hover': {
                backgroundColor: '#5848d5',
                border: '2px solid #5848d5',
                color: '#fff',
                fontWeight: 500,
            },
        },
        dialogHeader: {
            backgroundColor: '#5848d5',
            padding: '15px'
        },
        dialogContent: {
            padding: '20px 20px 30px'
        },
        dialogTitle: {
            fontSize: '10px',
            fontFamily: theme.typography.fontFamily,
            textTransform: 'uppercase',
            color: '#ffffff'
        },
        dialogSubTitle: {
            fontSize: '12px',
            fontFamily: theme.typography.fontFamily,
            textTransform: 'uppercase',
            color: '#5848d5',
            fontWeight: 600,
            marginBottom: '8px'
        },
        dialogClose: {
            position: 'absolute',
            top: 0,
            right: 0
        },
        fixGrid: {
            width: '100% !important',
            marginRight: 20
        },
        truncAccount: {
            fontSize: '22px',
            fontWeight: 500,
            color: '#fff',
            borderBottom: '2px solid #fff',
            marginRight: '10px'
        },
        truncAction: {
            color: '#fff',
            fontFamily: theme.typography.fontFamily,
            marginTop: '7px',
            marginLeft: '10px',
            textDecoration: 'none'
        },
        truncActionIcon: {
            verticalAlign: 'middle',
            marginRight: '5px',
            marginTop: '-4px'
        },
        manageAcc: {
            marginBottom: '30px'
        },
        clearTrans: {
            fontSize: '12px',
            fontFamily: theme.typography.fontFamily,
            textTransform: 'uppercase',
            padding: '2px 5px',
            marginTop: '-8px',
            fontWeight: 600,
            color: '#9a9a9a'
        },
    }),
);

interface props {
    fullWidth: boolean
    open: boolean
    onClose: () => void
}

export default function ViewChangeAccountModal(props: props) {
    const walletContextProps = useContext(WalletContext)
    const classes = useStyles();
    const truncAccount = walletContextProps.account.substring(0, 6) + '...' + walletContextProps.account.substring(walletContextProps.account.length - 4)
    const etherAddressLink = 'https://etherscan.io/address/'+ walletContextProps.account
    let connectType = 'Cannot determine connection'
    if (walletContextProps.isMetamask) {
        connectType = 'Connected with Metamask'
    }

    // const [dialogOpenChngAcc, setDialogOpenChngAcc] = React.useState<boolean>(false)

    return (
        <div>
            <Dialog fullWidth={props.fullWidth} open={props.open} onClose={props.onClose} classes={{paperScrollPaper: classes.dialog}}>
                <Container maxWidth="xl" className={classes.dialogContainer}>
                    <div className={classes.dialogHeader}>
                        <Grid container spacing={2} alignItems="center" justify="flex-start" direction="row" >
                            <Grid item>
                                <img src={metamaskAccount} width={40} className={classes.accountIcon} />
                            </Grid>
                            <Grid item>
                                <Grid container alignItems="flex-start" justify="flex-start" direction="column" >
                                    <Grid item>
                                        <div className={classes.dialogTitle}>Linked Address</div>
                                    </Grid>
                                    <Grid item>
                                        <Grid container alignItems="flex-start" justify="flex-start" direction="row" >
                                            <Grid item className={classes.truncAccount}>{truncAccount}</Grid>
                                            <Grid item>
                                                <Link className={classes.truncAction} onClick={() => navigator.clipboard.writeText(walletContextProps.account)} component="button">
                                                    <img src={IconCopy} width={16} className={classes.truncActionIcon} />
                                                    <span>Copy</span>
                                                </Link>
                                            </Grid>
                                            <Grid item>
                                                <Link className={classes.truncAction} onClick={() => window.open(etherAddressLink, '_blank')} component="button">
                                                    <img src={IconLink} width={14} className={classes.truncActionIcon} />
                                                    <span>Etherscan</span>
                                                </Link>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid> 
                        <div className={classes.dialogClose}><IconButton onClick={() => props.onClose()} color="secondary"><CloseIcon /></IconButton></div>
                    </div>
                    <Grid container className={classes.dialogContent} direction="column" justify="space-between" alignItems="stretch" >
                        <Grid item className={classes.manageAcc}>
                            <div className={classes.dialogSubTitle}> Manage </div>
                            <Grid container direction="row" justify="space-between" alignItems="center" spacing={1} className={classes.fixGrid}>
                                <Grid item> {connectType} </Grid>
                                <Grid item>
                                    <Button className={classes.chngAccount}
                                        // onClick={() => setDialogOpenChngAcc(true)}
                                        > Change </Button> 
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item>
                            <Grid container direction="row" justify="space-between" alignItems="center" spacing={1} className={classes.fixGrid}>
                                <Grid item className={classes.dialogSubTitle}> Recent Transactions </Grid>
                                <Grid item>
                                    <Button className={classes.clearTrans}
                                        // onClick={() => setDialogOpenChngAcc(true)}
                                        > Clear </Button> 
                                </Grid>
                            </Grid>
                            <Grid container direction="row" justify="flex-start" alignItems="flex-start" className={classes.fixGrid}>
                                <Grid item> Recent transactions will appear here </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Container>
            </Dialog>
        </div>
    );
}
