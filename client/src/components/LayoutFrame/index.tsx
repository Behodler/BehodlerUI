import * as React from 'react'
import { useState, useEffect, useContext } from 'react'
import { Box, makeStyles, createStyles, IconButton } from '@material-ui/core';
import discord from '../../../src/images/behodler/footer/discord.png'
import medium from '../../../src/images/behodler/footer/medium.png'
import github from '../../../src/images/behodler/footer/Github.png'
import twitter from '../../../src/images/behodler/footer/t.png'
import uniswap from '../../../src/images/behodler/footer/uniswap.png'
import telegram from '../../../src/images/behodler/footer/telegram.png'
import { Route, Switch, Redirect } from 'react-router-dom'
import Swap, { permittedRoutes as permittedBehodlerRoutes } from '../Behodler/Swap/index'

//client/src/blockchain/ethereumAPI.ts
import MetamaskNotFound from "./MetamaskNotFound";
import { WalletContext } from "../Contexts/WalletStatusContext";

//ocean, forest,skybackground
import backImage from "../../images/behodler/ocean.gif";
const useStyles = makeStyles((theme) =>
    createStyles({
        layoutFrameroot: {
            height: "100%",
            width: "100%",
            backgroundImage: `url(${backImage})`,
            backgroundRepeat: "repeat-y",
            backgroundSize: "cover",
            overflowY: "scroll",
        },
        layoutFramerRotNotConnected: {
            height: "100%",
            width: "100%",
            background: "linear-gradient(to bottom left, #9DC8F2, white)",
            backgroundRepeat: "repeat-y",
            backgroundSize: "cover",
            overflowY: "scroll",
        },
        content: {
            width: "100%",
            margin: 0,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
        },
        mainContent: {
            width: "100%",
        },
        whiteText: {
            color: "white",
        },
        footer: {
            width: "90%",
            maxWidth: "360px",
            paddingBottom: 40,
        },
        footerPanel: {
            backgroundColor: "rgba(255,255,255,0.7)",
            borderRadius: 10,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0px 16px",
            flexWrap: "wrap",
            [theme.breakpoints.down("sm")]: {
                padding: 0,
            },
        },
    })
);

export default function LayoutFrame(props: any) {
    const [redirect, setRedirect] = useState<string>("");
    const [showMetamaskInstallPopup, setShowMetamaskInstallPopup] = useState<boolean>(false);
    const renderRedirect = redirect !== "" ? <Redirect to={redirect} /> : "";
    const walletContextProps = useContext(WalletContext);
    const setBehodlerRoute = (route: permittedBehodlerRoutes) => {
        setRedirect(route);
    };
    const footerIconWidth = 24;
    useEffect(() => {
        if (renderRedirect !== "") setRedirect("");
    });

    const classes = useStyles();

    const notConnected: boolean =
        !walletContextProps.connected || !walletContextProps.networkName || !walletContextProps.initialized; //|| walletContextProps.account.length < 5
    const openFooter = (url: string) => window.open(url, "_blank");
    return (
        <Box className={notConnected ? classes.layoutFramerRotNotConnected : classes.layoutFrameroot}>
            {/* */}
            <MetamaskNotFound show={showMetamaskInstallPopup} closeAction={setShowMetamaskInstallPopup} />
            <div>{renderRedirect}</div>

            <Box className={classes.content}>
                <Box className={classes.mainContent} flexGrow={1}>
                    <Switch>
                        <Route path="/" exact>
                            <Swap setShowMetamaskInstallPopup={setShowMetamaskInstallPopup} connected={!notConnected} setRouteValue={setBehodlerRoute} route="swap2" />
                        </Route>
                        <Route path="/liquidity">
                            <Swap
                                setShowMetamaskInstallPopup={setShowMetamaskInstallPopup}
                                connected={!notConnected}
                                setRouteValue={setBehodlerRoute}
                                route="liquidity"
                            />
                        </Route>
                        <Route path="/swap2">
                            <Swap setShowMetamaskInstallPopup={setShowMetamaskInstallPopup} connected={!notConnected} setRouteValue={setBehodlerRoute} route="swap2" />
                        </Route>
                        <Route path="/governance">
                            <Swap
                                setShowMetamaskInstallPopup={setShowMetamaskInstallPopup}
                                connected={!notConnected}
                                setRouteValue={setBehodlerRoute}
                                route="governance"
                            />
                        </Route>
                    </Switch>
                </Box>
                <Box className={classes.footer}>
                    <Box className={classes.footerPanel}>
                        <Box>
                            <IconButton title="github" onClick={() => openFooter('https://github.com/WeiDaiEcosystem')}>
                                <img src={github} width={footerIconWidth} />
                            </IconButton>
                        </Box>
                        <Box>
                            <IconButton title="medium" onClick={() => openFooter('https://medium.com/weidaithriftcoin')}>
                                <img src={medium} width={footerIconWidth} />
                            </IconButton>
                        </Box>
                        <Box>
                            <IconButton title="twitter" onClick={() => openFooter('https://twitter.com/behodlerdex')}>
                                <img src={twitter} width={footerIconWidth} />
                            </IconButton>
                        </Box>
                        <Box>
                            <IconButton title="discord" onClick={() => openFooter('https://discord.gg/FHhsqmryZK')}>
                                <img src={discord} width={footerIconWidth} />
                            </IconButton>
                        </Box>
                        <Box>
                            <IconButton
                                title="uniswap"
                                onClick={() => openFooter('https://app.uniswap.org/#/swap?inputCurrency=0x155ff1a85f440ee0a382ea949f24ce4e0b751c65&outputCurrency=ETH')}
                            >
                                <img src={uniswap} width={footerIconWidth} />
                            </IconButton>
                        </Box>
                        <Box>
                            <IconButton title="telegram" onClick={() => openFooter('https://t.me/BehodlerDex')}>
                                <img src={telegram} width={footerIconWidth} />
                            </IconButton>
                        </Box>
                        {walletContextProps.primary ? (
                            <Box>
                                <IconButton title="governance" onClick={() => setBehodlerRoute('behodler/admin')}>
                                    src={twitter} width={footerIconWidth}
                                </IconButton>
                            </Box>
                        ) : (
                            ''
                        )}
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}
