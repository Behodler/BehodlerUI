import * as React from 'react'

import { Box, makeStyles, Theme, Grid, Hidden } from '@material-ui/core'

import { Images } from './ImageLoader'
import BigNumber from 'bignumber.js'


const sideScaler = (scale) => (perc) => (perc / scale) + "%"
const scaler = sideScaler(0.8)

const textScaler = (scale) => num => Math.floor(num * scale)
const scale = textScaler(0.9)
const inputStyles = makeStyles((theme: Theme) => ({
    root: {
        width: scale(310),
        marginTop:170
    },
    mobileRoot: {
        width: scale(400),
        background: "#360C57",
        borderRadius: 10,
        padding: 10
    },
    Direction: {

        // height: 17,
        fontFamily: "Gilroy",
        fontStyle: "normal",
        fontWeight: 600,
        fontSize: scale(16),
        // lineHeight: 17,
        /* identical to box height */
        color: "darkGrey",
        textAlign: "center",
        verticalAlign: " middle",
    },
    BalanceContainer: {

    },
    BalanceLabel: {
        height: scale(19),

        fontFamily: "Gilroy",
        fontStyle: "normal",
        fontWeight: 600,
        fontSize: scale(16),
        /* identical to box height */

        color: "darkGrey"
    },
    BalanceValue: {

        height: scale(19),

        fontFamily: "Gilroy",
        fontStyle: "normal",
        fontWeight: 600,
        fontSize: scale(16),
        color: "white"
    },
    Max: {
        /* (MAX) */

        height: scale(19),

        fontFamily: "Gilroy",
        fontStyle: "normal",
        fontWeight: 600,
        fontSize: scale(16),
        /* identical to box height */

        color: "#80C2FF",
        cursor: 'pointer'

    },
    PaddedGridItem: {
        marginRight: '5px',
        padding: 0
    },
    estimate: {
        height: scale(19),

        fontFamily: "Gilroy",
        fontStyle: "normal",
        fontWeight: 600,
        fontSize: scale(16),
        color: "white"
    },
    dollarSign: {
        color: "grey",
        marginRight: 5,
        display: "inline"
    },

    inputWide: {
        /* Vector */
        width: scale(300),
        height: scale(57),
        background: "#360C57",
        border: "1px solid rgba(70, 57, 130, 0.5)",
        boxSizing: "border-box",
        /* 2.00073731114506 */

        fontFamily: "Gilroy",
        fontStyle: "normal",
        fontWeight: 500,
        fontSize: scale(24),
        padding: "10px 20px 10px 20px",
        color: "#FFFFFF",
        outline: 0,
        borderRadius: 5,
        placeholder: {
            direction: "rtl"
        }
    },
    inputNarrow: {
        width: scale(270),
        background: "transparent",
        border: "none",
        /* 2.00073731114506 */

        fontFamily: "Gilroy",
        fontStyle: "normal",
        fontWeight: 500,
        fontSize: scale(20),
        color: "#FFFFFF",
        outline: 0,
        placeHolder: {
            direction: "rtl"
        }

    }
}))

const useStyles = makeStyles((theme: Theme) => ({
    root: {

        margin: '50px auto',
        backgroundColor: 'rgba(255,255,255,0)',
        borderRadius: 20,
        alignContent: "center",
        height: "100vh",
    },
    iconWrapper: {
        display: 'flex',
        justifyContent: 'center',
        margin: '24px 0',
    },
    buttonWrapper: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid rgba(218, 86, 221)",
        borderRadius: "5px",
        marginTop: 70,
        left: "35%",
    },
    buttonWrapperDisabled: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid rgba(60, 60, 60)",
        borderRadius: "5px",
        marginTop: 70,
        left: "35%",
    },
    swapButton: {
        background: "linear-gradient(105.11deg, rgba(218, 86, 221,0.1) 46.06%, rgba(218, 86, 221,0.1) 77.76%)",

        width: 500,
        '&:hover': {
            background: "rgba(218, 86, 221,0.4)",
            fontWeight: "bolder",
            textShadow: "2px 2px 5px white"
        },
    },
    swapButtonDisabled: {
        color: "grey",
        backgroundColor: "rgba(100,100,100,0.3)",
        width: 500,
        '&:hover': {
            backgroundColor: "rgba(100,100,100,0.3)",

        },
    },
    swapButtonMobile: {
        background: "linear-gradient(105.11deg, rgba(218, 86, 221,0.1) 46.06%, rgba(218, 86, 221,0.1) 77.76%)",

        width: 360,
        '&:hover': {
            background: "rgba(218, 86, 221,0.4)",
            fontWeight: "bolder",
            textShadow: "2px 2px 5px white"
        },
    },
    swapButtonMobileDisabled: {
        color: "grey",
        backgroundColor: "rgba(100,100,100,0.3)",

        width: 360,
        '&:hover': {
            backgroundColor: "rgba(100,100,100,0.3)",
        },
    },
    hideIt: {
        color: "white",
        fontWeight: "bold",
        display: "none"
    },
    centerWrapper: {
        margin: "0 auto",
        width: "80%",
        maxWidth: "1300px",
        position: "absolute",
        left: "10%",
        top: "40%",
    },
    leftSelector: {
        position: "absolute",
        left: "37%",
        top: "40%",
        zIndex: 10
    },
    rightSelector: {
        position: "absolute",
        right: "37%",
        top: "40%",
        zIndex: 10
    },
    leftField: {
        position: "absolute",
        left: scaler(14),
        top: "40%"
    },
    rightField: {
        position: "absolute",
        right: scaler(15),
        top: "40%"

    },
    monsterContainer: {
        position: "relative",
        zIndex: 1,
        width: 350,
        //   background: "radial-gradient(circle 90px, #DDD, transparent)",
        alignContent: "center",
        margin: "60px -45px 0px -55px"

    },
    monster: {
        display: "block",
        margin: "auto",
        '&:hover': {
            cursor: "pointer"
        },
        filter: "brightness(1.3)"
    },
    monsterMobile: {
        display: "block",
        '&:hover': {
            cursor: "pointer"
        },
        filter: "brightness(1.3)"
    },
    fieldGrid: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: "100%",
        position: "absolute",
        top: -15,
        left:-5

    },
    Info: {
        right: "1%",
        color: "white",
        marginTop: 30
    }, mobileGrid: {
        width: 400,
    },
    mobileSelectorGrid: {
    },
    mobileContainer: {
        height: "100vh",
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: '60px',
    },
    flippySwitch: {
        /* Ellipse 18 */
        width: 22,
        height: 22,
        marginTop: -260,
        background: "#2E2455",
        border: "1px solid #3C3682",
        boxSizing: "border-box",
        // top: 500,
        // left: 450,
        borderRadius: "50%",
        backgroundImage: `url(${Images[14]})`,
        backgroundSize: "cover",
        '&:hover': {
            cursor: "pointer",
            boxShadow: "0 0 4px 1px #AAf",
            background: "#473D6E",
            backgroundImage: `url(${Images[14]})`,
            backgroundSize: "cover",
        }
    }, flippySwitchSCXWarning: {
        width: 22,
        height: 22,
        marginTop: -350,
        background: "#2E2455",
        border: "1px solid #3C3682",
        boxSizing: "border-box",
        // top: 500,
        // left: 450,
        borderRadius: "50%",
        backgroundImage: `url(${Images[14]})`,
        backgroundSize: "cover",
        '&:hover': {
            cursor: "pointer",
            boxShadow: "0 0 4px 1px #AAf",
            background: "#473D6E",
            backgroundImage: `url(${Images[14]})`,
            backgroundSize: "cover",
        }
    },

    transactionFeedbackState: {
        fontSize: 30,
        color: "white"
    },
    moreInfo: {
        position: "relative"
    },
    impliedExchangeRate: {
        minHeight: "30px"
    },
    scxEstimationWarning: {
        color: "red",
        fontSize: scale(20),
        width: 400,
        textAlign: "center"
    },
    connectionWarning: {
        textAlign: 'center',
        color: 'white !important'
    }
}))


export interface TokenListItem {
    address: string
    name: string
    image: string
}

export interface TokenBalanceMapping {
    address: string
    balance: string
}




export default function (props: {}) {
    const classes = useStyles();
    const inputClasses = inputStyles();
    BigNumber.config({ EXPONENTIAL_AT: 50, DECIMAL_PLACES: 18 });


    return (
        <Box className={classes.root}>
            <Hidden lgUp>
                <div className={classes.mobileContainer} key="mobileContainer">
                    <Grid
                        container
                        direction="column"
                        justify="center"
                        alignItems="center"
                        className={classes.mobileGrid}
                        spacing={3}
                    >
                        <Grid item>
                            <Grid
                                container
                                direction="row"
                                justify="center"
                                alignItems="center"
                                className={classes.mobileSelectorGrid}
                            >
                                <Grid item>
                                </Grid>
                                <Grid item>
                                    <img width={180} src={Images[13]} className={classes.monsterMobile} />
                                </Grid>
                                <Grid item className={classes.connectionWarning}>
                                    Connect your wallet to use the Behodler AMM
                                </Grid>
                            </Grid>

                        </Grid>
                        <Grid item key="mobileGridInput">

                        </Grid>
                        <Grid item key="mobileGridOutput">

                        </Grid>

                        <Grid item>

                        </Grid>
                        <Grid item>

                        </Grid>
                        <Grid item>
                            <Grid container
                                direction="column"
                                justify="center"
                                alignItems="center"
                                spacing={2}
                                className={classes.Info}
                            >
                                <Grid item className={classes.impliedExchangeRate}>

                                </Grid>
                                <Grid item>

                                </Grid>
                                <Grid item>

                                </Grid>
                            </Grid>
                        </Grid>

                    </Grid>
                </div>
            </Hidden>
            <Hidden mdDown>

                <Grid container
                    direction="column"
                    justify="center"
                    alignItems="center"
                    className={classes.fieldGrid}
                    key="desktopContainer"
                >
                    <Grid item key="textSection">
                        <Grid
                            container
                            direction="row"
                            justify="center"
                            alignItems="center"
                            spacing={3}
                        >
                            <Grid item key="dekstopGridInput">
                                <Grid
                                    container
                                    direction="column"
                                    justify="flex-start"
                                    alignItems="stretch"
                                    spacing={2}
                                    key={"dekstopGridInput_grid"}
                                    className={inputClasses.root}
                                >
                                    <Grid item>

                                    </Grid>
                                    <Grid item>

                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item>
                                <Grid
                                    container
                                    direction="row"
                                    justify="space-between"
                                    alignItems="center"
                                    id="central-selector-monster-grid"
                                >
                                    <Grid item>

                                    </Grid>
                                    <Grid item>
                                        <div className={classes.monsterContainer} >
                                            <img width={350} src={Images[13]} className={classes.monster} />
                                        </div>
                                    </Grid>
                                    <Grid item>

                                    </Grid>
                                </Grid>
                            </Grid>

                            <Grid item key="dekstopGridOuput">
                                <Grid
                                    container
                                    direction="column"
                                    justify="flex-start"
                                    alignItems="stretch"
                                    spacing={2}
                                    key={"dekstopGridOutput_grid"}
                                    className={inputClasses.root}
                                >
                                    <Grid item>
                                        <div key={"desktopOutput"}>

                                        </div>
                                    </Grid>
                                    <Grid item>

                                    </Grid>
                                </Grid>


                            </Grid>
                        </Grid>

                    </Grid>
                    <Grid item className={classes.connectionWarning}>
                                    Connect your wallet to use the Behodler AMM
                                </Grid>
                    <Grid item>

                    </Grid>
                    <Grid item>
                        <Grid container
                            direction="column"
                            justify="center"
                            alignItems="center"
                            spacing={2}
                            className={classes.Info}
                        >

                            <Grid item className={classes.impliedExchangeRate}>

                            </Grid>
                            <Grid item className={classes.moreInfo}>

                            </Grid>
                            <Grid item>

                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Hidden>
        </Box >)
}
