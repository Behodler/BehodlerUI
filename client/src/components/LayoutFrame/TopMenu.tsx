import React, { useContext } from 'react'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import IconButton from '@material-ui/core/IconButton'
import { createStyles, fade, Theme, makeStyles } from '@material-ui/core/styles'
import MenuIcon from '@material-ui/icons/Menu'
import { Grid, Hidden, Link, Menu, MenuItem, Button } from '@material-ui/core'
import { permittedRoutes } from '../Behodler/Swap'
import metamaskAccount from '../../images/behodler/metamaskaccount.png'
import EyeLogo from '../../images/Eye.png'
import ScarcityLogo from '../../images/scarcity.png'
import { useLocation } from 'react-router-dom'
import BigNumber from 'bignumber.js'
import ViewChangeAccountModal from './ViewChangeAccountModal'
import { WalletContext } from '../Contexts/WalletStatusContext'

declare global {
    interface String {
        fromRAY(): string;
        fromWAD(): string;
        toWAD(): string;
        asPercentage(): string;
        truncBig(): string;
        dropDecimals(): string;
    }
}
String.prototype.truncBig = function (): string {
    const big = new BigNumber(this.toString());
    return big.isNaN() ? this.toString() : big.decimalPlaces(4).toString();
};

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        menuRoot: {
            flexGrow: 1,
        },
        innerMenu: {
            flexGrow: 1,
        },
        appBar: {
            color: "white",
            height: 100,
            backgroundColor: "transparent",
            boxShadow: "none",
            "& > div > div": {
                flexWrap: "nowrap"
            }
        },
        menuButton: {
            marginRight: theme.spacing(2),
        },
        title: {
            flexGrow: 1,
            display: "none",
            [theme.breakpoints.up("sm")]: {
                display: "block",
            },
        },
        search: {
            marginLeft: 0,
            flexWrap: "nowrap",
            [theme.breakpoints.up("sm")]: {
                marginLeft: theme.spacing(1),
            },
            "& > div": {
                flexWrap: "nowrap",
                width: "auto"
            }
        },
        accountHold: {
            marginLeft: "20px"
        },
        inputRoot: {
            color: "inherit",
        },
        inputInput: {
            padding: theme.spacing(1, 1, 1, 0),
            // vertical padding + font size from searchIcon
            paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
            transition: theme.transitions.create("width"),
            width: "100%",
            [theme.breakpoints.up("sm")]: {
                width: "12ch",
                "&:focus": {
                    width: "20ch",
                },
            },
        },
        menu: {
            borderRadius: 10,
        },
        menuList: {
            marginTop: 20,
            backgroundColor: "#00A3DA",
            color: "white",
            "&:hover": {
                backgroundColor: "#3CDFFF",
            },
        },
        textLink: {
            marginTop: 20,
            marginLeft: 50,
            fontWeight: "bold",
            fontSize: 20,
            color: "white",
            "&:hover": {
                textDecoration: "none",
            },
        },
        textLinkSelected: {
            marginTop: 20,
            marginLeft: 50,
            fontSize: 20,
            color: "white",
            textDecoration: "underline",
            fontWeight: 800,
            "&:hover": {
                textDecoration: "none",
            },
        },
        ethBalance: {
            fontSize: theme.typography.subtitle2.fontSize,
            fontFamily: theme.typography.fontFamily,
            padding: '10px 20px',
            borderRadius: 10,
            marginLeft: 10,
            color: theme.palette.type == "dark" ? "white" : "black",
            backgroundColor: fade(theme.palette.common.white, 0.15),
            "&:hover": {
                backgroundColor: fade(theme.palette.common.white, 0.25),
            },
        },
        truncAccount: {
            fontSize: theme.typography.subtitle2.fontSize,
            fontFamily: theme.typography.fontFamily,
            // color: theme.palette.type == 'dark' ? 'white' : 'black',
            border: "1px solid #3379DB",
            borderRadius: 10,
            padding: '5px 15px 5px 15px',
            backgroundColor: '#3379DB',
            color: 'white',
            '&:hover': {
                backgroundColor: '#2589d7',
                border: '1px solid #298bd8'
            },
            marginLeft: '-2px'
        },
        addNewToken: {
            color: '#000',
            border: '1px solid #ffffff',
            padding: '4px',
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            minWidth: 'auto'
        },
        chngAccount: {
            fontSize: theme.typography.subtitle2.fontSize,
            fontFamily: theme.typography.fontFamily,
            // color: theme.palette.type == 'dark' ? 'white' : 'black',
            border: '1px solid #3379DB',
            borderRadius: 10,
            padding: '5px 15px 5px 15px',
            backgroundColor: '#3379DB',
            color: 'white',
            '&:hover': {
                backgroundColor: '#2589d7',
                border: '1px solid #298bd8'
            },
        },
        fixGrid: {
            width: "100% !important",
            marginRight: 20,
        },
        metamaskWarning: {
            background: "#D6E8D8",
            fontWeight: "bold",
            color: "darkgrey",
            flexWrap: "unset",
        },
        metagrid: {
            paddingLeft: 10,
        },
    })
);

interface props {
    setRouteValue: (v: permittedRoutes) => void,
    ethBalance: string
    truncAccount: string
}

export default function TopMenu(props: props) {
    const walletContextProps = useContext(WalletContext)
    const classes = useStyles()
    const location = useLocation().pathname.substring(1)
    const LeftLink = (props: { text: string; nav: () => void; selected: boolean }) => (
        <Link
            className={props.selected ? classes.textLinkSelected : classes.textLink}
            onClick={props.nav}
            component="button">
            {props.text}
        </Link>
    );
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
    const [accountOpen, setAccountOpen] = React.useState<boolean>(false)

    const accountClose = () => {
        setAccountOpen(false);
    };
    

    const menuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget)
    };

    const closeMenu = () => setAnchorEl(null);

    const route = (route: permittedRoutes) => {
        props.setRouteValue(route);
        closeMenu()
    };

    const eyelink = "https://www.dextools.io/app/uniswap/pair-explorer/0x54965801946d768b395864019903aef8b5b63bb3"

    return (
        <div className={classes.menuRoot}>
            <AppBar position="static" className={classes.appBar}>
                <Toolbar>
                    <Grid container direction="row" justify="space-between" alignItems="center">
                        <Grid item container direction="row" justify="flex-start" alignItems="center" className={classes.innerMenu}>
                            <Hidden mdDown>
                                <LeftLink text="Swap" nav={() => props.setRouteValue('swap2')} selected={location === 'swap2'} />
                                <LeftLink text="EYE" nav={() => window.open(eyelink, '_blank')} selected={false} />
                            </Hidden>
                        </Grid>
                        <Grid item container direction="row" justify="flex-end" alignItems="center" className={classes.search}>
                            {walletContextProps &&
                                walletContextProps.chainId &&
                                walletContextProps.isMetamask && (
                                    <>
                                        <Grid
                                            container
                                            item
                                            spacing={2}
                                            direction="row"
                                            justify="flex-end"
                                            alignItems="center"
                                        >
                                            <Grid item>
                                                <Button
                                                    className={classes.addNewToken}
                                                    onClick={() => {
                                                        const params: any = {
                                                            type: 'ERC20',
                                                            options: {
                                                                address:
                                                                    '0x155ff1a85f440ee0a382ea949f24ce4e0b751c65',
                                                                symbol: 'EYE',
                                                                decimals: 18,
                                                                image:
                                                                    'https://etherscan.io/token/images/behodler_32.png'
                                                            }
                                                        }

                                                        if (
                                                            walletContextProps &&
                                                            walletContextProps.isMetamask &&
                                                            walletContextProps.provider.request
                                                        ) {
                                                            walletContextProps.provider
                                                                .request({
                                                                    method: 'wallet_watchAsset',
                                                                    params
                                                                })
                                                                .then(success => {
                                                                    if (success) {
                                                                        console.log(
                                                                            'Successfully added EYE to MetaMask'
                                                                        )
                                                                    } else {
                                                                        throw new Error('Something went wrong.')
                                                                    }
                                                                })
                                                                .catch(console.error)
                                                        }
                                                    }}
                                                >
                                                    <img src={EyeLogo} width={20} />
                                                </Button>
                                            </Grid>
                                            <Grid item>
                                                <Button
                                                    className={classes.addNewToken}
                                                    onClick={() => {
                                                        const params: any = {
                                                            type: 'ERC20',
                                                            options: {
                                                                address:
                                                                    '0x1b8568fbb47708e9e9d31ff303254f748805bf21',
                                                                symbol: 'Scarcity',
                                                                decimals: 18,
                                                                image:
                                                                    'https://etherscan.io/token/images/behodlerscarcity_32.png'
                                                            }
                                                        }

                                                        if (
                                                            walletContextProps &&
                                                            walletContextProps.isMetamask &&
                                                            walletContextProps.provider.request
                                                        ) {
                                                            walletContextProps.provider
                                                                .request({
                                                                    method: 'wallet_watchAsset',
                                                                    params
                                                                })
                                                                .then(success => {
                                                                    if (success) {
                                                                        console.log(
                                                                            'Successfully added Scarcity to MetaMask'
                                                                        )
                                                                    } else {
                                                                        throw new Error('Something went wrong.')
                                                                    }
                                                                })
                                                                .catch(console.error)
                                                        }
                                                    }}
                                                >
                                                    <img src={ScarcityLogo} width={20} />
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </>
                                )}
                            <Grid
                                container
                                item
                                direction="row"
                                justify="flex-end"
                                alignItems="center"
                                className={classes.accountHold}>
                                <Hidden mdDown>
                                    <Grid item>
                                        <Button
                                            className={classes.truncAccount}
                                            onClick={() => setAccountOpen(true)}
                                        >
                                            <Grid
                                                container
                                                direction="row"
                                                justify="space-evenly"
                                                alignItems="center"
                                                spacing={1}
                                                className={classes.fixGrid}>
                                                <Grid item> {props.truncAccount}</Grid>
                                                <img src={metamaskAccount} width={15} />
                                            </Grid>
                                        </Button>
                                    </Grid>
                                    <Grid item>
                                        <div className={classes.ethBalance}>{props.ethBalance.truncBig()} ETH</div>
                                    </Grid>
                                </Hidden>
                                <Hidden lgUp>
                                    <Grid item>
                                        <IconButton
                                            edge="start"
                                            className={classes.menuButton}
                                            color="inherit"
                                            aria-label="open drawer"
                                            onClick={menuClick}>
                                            <MenuIcon />
                                        </IconButton>
                                    </Grid>
                                </Hidden>
                            </Grid>
                            <Hidden lgUp>
                                <Menu
                                    id="simple-menu"
                                    anchorEl={anchorEl}
                                    keepMounted
                                    open={Boolean(anchorEl)}
                                    onClose={closeMenu}
                                    className={classes.menu}
                                >
                                    <MenuItem className={classes.menuList} onClick={() => route('swap2')}>Swap</MenuItem>
                                    <MenuItem className={classes.menuList} onClick={() => window.open(eyelink, '_blank')}>EYE</MenuItem>
                                </Menu>
                            </Hidden>
                        </Grid>
                    </Grid>
                </Toolbar>
            </AppBar>

            <ViewChangeAccountModal
                open={accountOpen}
                onClose={accountClose}
            />
        </div>
    );
}