import React, {FC, useCallback, useContext} from "react";
import {Box, createStyles, IconButton, makeStyles} from "@material-ui/core";
import github from "../../images/behodler/footer/Github.png";
import medium from "../../images/behodler/footer/medium.png";
import twitter from "../../images/behodler/footer/t.png";
import discord from "../../images/behodler/footer/discord.png";
import uniswap from "../../images/behodler/footer/uniswap.png";
import telegram from "../../images/behodler/footer/telegram.png";
import {WalletContext} from "../Contexts/WalletStatusContext";
import {permittedRoutes as permittedBehodlerRoutes} from "../Behodler/Swap";

interface SocialFooterProps {
    setBehodlerRoute: (route: permittedBehodlerRoutes) => void
}

const useStyles = makeStyles((theme) =>
    createStyles({
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

const footerIconWidth = 24;

const SocialFooter: FC<SocialFooterProps> = ({setBehodlerRoute}) => {
    const classes = useStyles()
    const walletContextProps = useContext(WalletContext);
    const openFooter = useCallback((url: string) => window.open(url, "_blank"), [])

    return (
        <Box className={classes.footer}>
            <Box className={classes.footerPanel}>
                <Box>
                    <IconButton title="github"
                                onClick={() => openFooter('https://github.com/WeiDaiEcosystem')}>
                        <img src={github} width={footerIconWidth}/>
                    </IconButton>
                </Box>
                <Box>
                    <IconButton title="medium"
                                onClick={() => openFooter('https://medium.com/weidaithriftcoin')}>
                        <img src={medium} width={footerIconWidth}/>
                    </IconButton>
                </Box>
                <Box>
                    <IconButton title="twitter"
                                onClick={() => openFooter('https://twitter.com/behodlerdex')}>
                        <img src={twitter} width={footerIconWidth}/>
                    </IconButton>
                </Box>
                <Box>
                    <IconButton title="discord"
                                onClick={() => openFooter('https://discord.gg/FHhsqmryZK')}>
                        <img src={discord} width={footerIconWidth}/>
                    </IconButton>
                </Box>
                <Box>
                    <IconButton
                        title="uniswap"
                        onClick={() => openFooter('https://app.uniswap.org/#/swap?inputCurrency=0x155ff1a85f440ee0a382ea949f24ce4e0b751c65&outputCurrency=ETH')}
                    >
                        <img src={uniswap} width={footerIconWidth}/>
                    </IconButton>
                </Box>
                <Box>
                    <IconButton title="telegram" onClick={() => openFooter('https://t.me/BehodlerDex')}>
                        <img src={telegram} width={footerIconWidth}/>
                    </IconButton>
                </Box>
                {walletContextProps.primary ? (
                    <Box>
                        <IconButton title="governance"
                                    onClick={() => setBehodlerRoute('behodler/admin')}>
                            src={twitter} width={footerIconWidth}
                        </IconButton>
                    </Box>
                ) : (
                    ''
                )}
            </Box>
        </Box>
    );
}

export default SocialFooter