import { Grid, makeStyles, Theme } from '@material-ui/core'
import * as React from 'react'
import { Images } from '../ImageLoader'
import Menu from './Menu'

const useStyles =(scale)=> makeStyles((theme: Theme) => ({
    root: {
    },
    outerCircle: {
        /* Vector */
        alignContent: "center",
        alignItems: "center",
        width: 140 * scale,
        height: 140 * scale,
        borderRadius: "50%",
        background: "rgba(54,12,87,0.9)",
        transitionProperty: "box-shadow",
        transitionDuration:"0.25s",
        // boxShadow: "120px 80px 40px 20px #0ff",
        "&:hover": {
            cursor: "pointer",
            background: "rgba(54,12,87,0.7)",
            boxShadow:"0 0 10px 1px #fff", 
           
        }
        //  /rgba(47, 48, 59, 0.255)
        // background: "linear-gradient(72.04deg, rgba(23, 23, 20, 0) 7.74%, rgba(47, 48, 59, 0.255) 84.79%)"
    },
    innerCircle: {
        display: "flex",
        alignItems: 'center',
        margin: "0 auto",
    }
}))

interface props {
    token: number,
    scale:number
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
                    <img alt="token" src={Images[props.token]} width={70 * props.scale} />
                </div>
            </Grid>

        </Grid>
        <Menu show={showMenu} weth10Address="0x4f5704D9D2cbCcAf11e70B34048d41A0d572993F" 
        scarcityAddress="0x1b8568fbb47708e9e9d31ff303254f748805bf21"
        networkName="main" 
        setShow={setShowMenu}
        />
    </div>
}