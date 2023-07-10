import React, { useContext, useEffect } from 'react'
import { Grid, makeStyles, Theme } from '@material-ui/core'

import Menu from './Menu'
import { WalletContext } from "../../../../Contexts/WalletStatusContext";
import { atom, useAtom } from 'jotai';

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
    scale: number,
    setAddress: (a: string) => void
    network: string
    minting: boolean
    input: boolean
    mobile?: boolean
}
export const mintingAtom = atom(false)

export default function TokenSelector(props: props) {
    const [showMenu, setShowMenu] = React.useState<boolean>(false)
    const walletContextProps = useContext(WalletContext);
    const [, setMinting] = useAtom(mintingAtom)

    useEffect(() => {
        setMinting(props.minting)
    }, [props.minting])

    const weth10Address = walletContextProps.contracts.behodler.Behodler2.Weth10.address;
    const scarcityAddress = walletContextProps.contracts.behodler.Behodler2.Behodler2.address;

    const classes = useStyles(props.scale)()
    const isPyro = (props.minting && !props.input) || (!props.minting && props.input)
    return <div className={classes.root}>
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
                    <img alt="token"
                        src={props.tokenImage}
                        width={(isPyro ? 100 : 80) * props.scale} />
                </div>
            </Grid>

        </Grid>

        <Menu
            show={showMenu}
            weth10Address={weth10Address}
            scarcityAddress={scarcityAddress}
            networkName={props.network}
            setShow={setShowMenu}
            mobile={props.mobile || false}
            setAddress={props.setAddress}
            input={props.input}
        /> 
    </div>
}
