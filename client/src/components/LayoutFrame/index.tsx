import * as React from 'react'
import { useContext } from 'react'
import { Box, makeStyles, createStyles, Button } from '@material-ui/core';
import Swap from '../Behodler/Swap/index'
import { WalletContext } from "../Contexts/WalletStatusContext";
import backImage from "../../images/new/background2.png";

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
    const walletContextProps = useContext(WalletContext);
    const classes = useStyles();

    const notConnected: boolean =
        !walletContextProps.connected || !walletContextProps.networkName || !walletContextProps.initialized; //|| walletContextProps.account.length < 5

    return (
        <div>
            {notConnected ? <Button onClick={() => walletContextProps.connectAction.action()}>Connect</Button> : <div></div>}
            <Box className={notConnected ? classes.layoutFramerRotNotConnected : classes.layoutFrameroot}>
                <Box className={classes.content}>
                    <Box className={classes.mainContent} flexGrow={1}>
                        {notConnected ? "" : <Swap connected={!notConnected} route="swap2" />}
                    </Box>
                </Box>
            </Box>
        </div>
    )
}
