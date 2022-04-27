import { Grid, makeStyles, Theme } from '@material-ui/core'
import * as React from 'react'
import Menu from './Menu'
import { TokenBalanceMapping } from '../index'
const useStyles = (scale) => makeStyles((theme: Theme) => ({
    root: {
        position: 'relative',
        zIndex: 10
    },
    outerCircle: {
        alignContent: "center",
        alignItems: "center",
        width: 140 * scale,
        height: 140 * scale,
        borderRadius: "50%",
        background: "rgba(54,12,87,0.9)",
        transitionProperty: "box-shadow",
        transitionDuration: "0.25s",
        "&:hover": {
            cursor: "pointer",
            background: "rgba(54,12,87,0.7)",
            boxShadow: "0 0 15px 2px #FFF",

        }
    },
    innerCircle: {
        display: "flex",
        alignItems: 'center',
        margin: "0 auto",
    }
}))

interface props {
    tokenImage: string,
    balances: TokenBalanceMapping[]
    scale: number,
    setAddress: (a: string) => void
    network: string
    mobile?: boolean
}

export default function TokenSelector(props: props) {
    const [showMenu, setShowMenu] = React.useState<boolean>(false)

    const classes = useStyles(props.scale)()
    return <div className={classes.root} >
        <Grid
            className={classes.outerCircle}
            container
            direction="row"
            justifyContent="center"
            alignItems="center"
            onClick={() => setShowMenu(true)}
        >
            <Grid item>
                <div className={classes.innerCircle}>
                    <img alt="token" src={props.tokenImage} width={70 * props.scale} />
                </div>
            </Grid>

        </Grid>
        <Menu show={showMenu}
            networkName={props.network}
            setShow={setShowMenu}
            mobile={props.mobile || false}
            setAddress={props.setAddress}
            balances={props.balances}
        />
    </div>
}
