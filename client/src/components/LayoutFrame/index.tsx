import * as React from 'react'
import { useState, useEffect, useContext } from 'react'
import { Box, makeStyles, createStyles } from '@material-ui/core';
import { Route, Switch, Redirect } from 'react-router-dom'
import Swap, { permittedRoutes as permittedBehodlerRoutes } from '../Behodler/Swap/index'

//client/src/blockchain/ethereumAPI.ts
import MetamaskNotFound from "./MetamaskNotFound";
import { WalletContext } from "../Contexts/WalletStatusContext";

//ocean, forest,skybackground
import backImage from "../../images/new/background3.png";
const useStyles = makeStyles((theme) =>
    createStyles({
        layoutFrameroot: {
            backdropFilter: "blur(4px)",
            height: "100%",
            width: "100%",
            backgroundImage: `url(${backImage})`,
            background: '#C4C4C4',
            backgroundRepeat: "repeat-y",
            backgroundSize: "100% 100%",
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
    useEffect(() => {
        if (renderRedirect !== "") setRedirect("");
    });

    const classes = useStyles();

    const notConnected: boolean =
        !walletContextProps.connected || !walletContextProps.networkName || !walletContextProps.initialized; //|| walletContextProps.account.length < 5

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
            
            </Box>
        </Box>
    )
}
