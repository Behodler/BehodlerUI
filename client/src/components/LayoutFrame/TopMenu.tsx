import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
// import Typography from '@material-ui/core/Typography';
// import InputBase from '@material-ui/core/InputBase';
import { createStyles, fade, Theme, makeStyles } from '@material-ui/core/styles';
import MenuIcon from '@material-ui/icons/Menu';
import { Link, Menu, MenuItem, Typography } from '@material-ui/core';
import { permittedRoutes } from '../Behodler/Swap';
import eyelogo from '../../images/behodler/landingPage/EyeLogo.png'
import { useLocation } from 'react-router-dom';
// import SearchIcon from '@material-ui/icons/Search';

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        menuRoot: {
            flexGrow: 1,
        },
        appBar: {
            color: 'black',
            height: 100,
            backgroundColor: 'white'
        },
        menuButton: {
            marginRight: theme.spacing(2),
        },
        title: {
            flexGrow: 1,
            display: 'none',
            [theme.breakpoints.up('sm')]: {
                display: 'block',
            },
        },
        search: {
            position: 'absolute',
            borderRadius: theme.shape.borderRadius,
            backgroundColor: fade(theme.palette.common.white, 0.15),
            '&:hover': {
                backgroundColor: fade(theme.palette.common.white, 0.25),
            },
            marginLeft: 0,
            width: '100%',
            [theme.breakpoints.up('sm')]: {
                marginLeft: theme.spacing(1),
                width: 'auto',
            },
            right: 0
        },
        inputRoot: {
            color: 'inherit',
        },
        inputInput: {
            padding: theme.spacing(1, 1, 1, 0),
            // vertical padding + font size from searchIcon
            paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
            transition: theme.transitions.create('width'),
            width: '100%',
            [theme.breakpoints.up('sm')]: {
                width: '12ch',
                '&:focus': {
                    width: '20ch',
                },
            },
        },
        menu: {
            borderRadius: 10
        },

        menuList: {
            marginTop: 20,
            backgroundColor: '#00A3DA',
            color: 'white',
            '&:hover': {
                backgroundColor: '#3CDFFF',
            }
        },
        textLink: {
            marginLeft: 70,
            color: '#404040',
            '&:hover': {
                textDecoration: 'none',
            }
        },
        textLinkSelected: {
            marginLeft: 70,
            color: 'black',
            textDecoration: 'underline',
            fontWeight: 800,
            '&:hover': {
                textDecoration: 'none',
            }
        },
    }),
);

interface props {
    setRouteValue: (v: permittedRoutes) => void
}

export default function TopMenu(props: props) {
    const classes = useStyles();
    const location = useLocation().pathname.substring(1)
    const LeftLink = (props: { text: string, nav: () => void, selected: boolean }) => (
        <Link className={props.selected ? classes.textLinkSelected : classes.textLink} onClick={props.nav} component="button">
            <Typography variant="h5">{props.text}</Typography>
        </Link>
    )
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const menuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const closeMenu = () => setAnchorEl(null)

    const route = (route: permittedRoutes) => {
        props.setRouteValue(route)
        closeMenu()
    };
    return (
        <div className={classes.menuRoot}>
            <AppBar position="static" className={classes.appBar}>
                <Toolbar>
                    <div>
                        <img src={eyelogo} width={150} />
                    </div>
                    <LeftLink text="Swap" nav={() => props.setRouteValue('swap')} selected={location === 'swap'} />
                    <LeftLink text="Liquidity mining" nav={() => props.setRouteValue('liquidity')} selected={location === 'liquidity'} />
                    <LeftLink text="Vote" nav={() => props.setRouteValue('governance')} selected={location === 'governance'} />
                    <LeftLink text="EYE" nav={() => window.open('https://medium.com/weidaithriftcoin/the-behodler-launch-in-partnership-with-degen-vc-bd865c1443a4', '_blank')} selected={false} />
                    <div className={classes.search}>
                        <IconButton
                            edge="start"
                            className={classes.menuButton}
                            color="inherit"
                            aria-label="open drawer"
                            onClick={menuClick}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Menu
                            id="simple-menu"
                            anchorEl={anchorEl}
                            keepMounted
                            open={Boolean(anchorEl)}
                            onClose={closeMenu}
                            className={classes.menu}
                        >
                            <MenuItem className={classes.menuList} onClick={() => route('sisyphus')}>Sisyphus</MenuItem>
                            <MenuItem className={classes.menuList} onClick={() => route('faucet')}>Scarcity Faucet</MenuItem>
                        </Menu>
                    </div>
                </Toolbar>
            </AppBar>
        </div>
    );
}
