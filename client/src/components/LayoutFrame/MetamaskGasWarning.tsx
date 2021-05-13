import React, { useEffect, useState } from "react";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import { Theme, makeStyles } from "@material-ui/core/styles";
import { Grid } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";

const useStyles = makeStyles((theme: Theme) => ({
    metamaskWarning: {
        padding: "8px",
        background: "#D6E8D8",
        fontWeight: "bold",
        color: "darkgrey",
        flexWrap: "unset",
    },
    metagrid: {
        paddingLeft: 10,
        textAlign: "center",
    },
}));

const WEEK = 15120000;
const METMAMASKHIDE = "METMAMASKHIDE";
export default function MetamaskGasWarning() {
    const classes = useStyles();
    const [hidden, setHidden] = useState<boolean>(false);
    const [hideClicked, setHideClicked] = useState<boolean>(false);
    useEffect(() => {
        const warning = localStorage.getItem(METMAMASKHIDE);
        if (warning) {
            const duration = parseInt(warning);
            const elapsed = new Date().getTime() - duration;
            setHidden(elapsed < WEEK);
        }
    });

    useEffect(() => {
        if (hideClicked) {
            localStorage.setItem(METMAMASKHIDE, `${new Date().getTime()}`);
            setHidden(true);
            setHideClicked(false);
        }
    });
    return hidden ? (
        <div></div>
    ) : (
        <Toolbar>
            <Grid
                container
                direction="row"
                justify="space-between"
                alignItems="center"
                className={classes.metamaskWarning}>
                <Grid item className={classes.metagrid}>
                    Please note: Metmask appears to be overestimating gas. A fix is in progress. If the estimate is
                    comparable to Uniswap, then it is overestimated. Please do not worry when confirming.
                </Grid>
                <Grid item>
                    <IconButton onClick={() => setHideClicked(true)} color="secondary">
                        <CloseIcon />
                    </IconButton>
                </Grid>
            </Grid>
        </Toolbar>
    );
}
