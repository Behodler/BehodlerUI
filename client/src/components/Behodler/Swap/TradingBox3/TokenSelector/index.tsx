import { Grid, makeStyles, Theme } from '@material-ui/core'
import * as React from 'react'
import Menu from './Menu'

const useStyles =(scale)=> makeStyles((theme: Theme) => ({
    root: {
    },
    outerCircle: {
        alignContent: "center",
        alignItems: "center",
        width: 140 * scale,
        height: 140 * scale,
        borderRadius: "50%",
        background: "rgba(54,12,87,0.9)",
        transitionProperty: "box-shadow",
        transitionDuration:"0.25s",
        "&:hover": {
            cursor: "pointer",
            background: "rgba(54,12,87,0.7)",
            boxShadow:"0 0 10px 1px #fff", 
           
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
    scale:number,
    setAddress:(a:string)=>void
    network:string
    mobile?:boolean
}

export default function TokenSelector(props: props) {
    const [showMenu, setShowMenu] = React.useState<boolean>(false)

    const classes = useStyles(props.scale)()
    return <div className={classes.root} >
        <Grid
            className={classes.outerCircle}
            container
            direction="row"
            justify="center"
            alignItems="center"
            onClick={()=>setShowMenu(true)}
        >
            <Grid item>
                <div className={classes.innerCircle}>
                    <img alt="token" src={props.tokenImage} width={70 * props.scale} />
                </div>
            </Grid>

        </Grid>
        <Menu show={showMenu} weth10Address="0x4f5704D9D2cbCcAf11e70B34048d41A0d572993F" 
        scarcityAddress="0x1b8568fbb47708e9e9d31ff303254f748805bf21"
        networkName={props.network} 
        setShow={setShowMenu}
        mobile = {props.mobile || false}
        setAddress={props.setAddress}
        />
    </div>
}