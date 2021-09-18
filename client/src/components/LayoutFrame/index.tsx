import * as React from 'react'
import { useContext } from 'react'
import { Box, makeStyles, createStyles, Button } from '@material-ui/core';
import Swap from '../Behodler/Swap/index'
import backImage from "../../images/new/background2.png";
import { UIContainerContextProps } from '@behodler/sdk/dist/types';
import { ContainerContext } from '../Contexts/UIContainerContextDev';

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
export default function LayoutFrame(props: {}) {
    const uiContainerContextProps = useContext<UIContainerContextProps>(ContainerContext)
    const classes = useStyles();

    const chainId = uiContainerContextProps.walletContext.chainId || 0;
    const account = uiContainerContextProps.walletContext.account || '0x0'
    const notConnected: boolean =
        chainId === 0 || account.length < 5
    const connector = uiContainerContextProps.walletContext.connector
    return (
        <div>
            {notConnected ? <Button onClick={async () => {
                if (!!connector) {
                    await uiContainerContextProps.walletContext.activate(connector)
                }
                else alert("Could not connect")
            }}>Connect</Button> : <div></div>
            }
            <Box className={notConnected ? classes.layoutFramerRotNotConnected : classes.layoutFrameroot}>
                <Box className={classes.content}>
                    <Box className={classes.mainContent} flexGrow={1}>
                        <Swap />
                    </Box>
                </Box>
            </Box>
        </div >
    )
}
