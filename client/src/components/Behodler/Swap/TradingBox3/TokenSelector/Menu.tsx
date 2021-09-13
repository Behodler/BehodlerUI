import * as React from 'react'
import { useState, useEffect } from 'react'
import tokenListJSON from '../../../../../blockchain/behodlerUI/baseTokens.json'
import { Images } from '../ImageLoader'
import { Grid, List, ListItem, ListItemIcon, makeStyles, Modal, Theme, CircularProgress } from '@material-ui/core';


const useStyles = (isMobile: boolean) => makeStyles((theme: Theme) => ({
    root: {
        position: "absolute",
        width: isMobile ? 250 : 400,
        height: isMobile ? 500 : 671,
        left: "40%",
        top: "10%",

        background: "#1B1A2D",
        borderRadius: 10,

    },
    grid: {
        color: "white",
        height: "100%",
        margin: 15
    },
    search: {
        /* Rectangle 3172 */

        width: isMobile ? 200 : 345,
        height: isMobile ? 40 : 57,
        background: "#292743",
        border: "1px solid #795ECA",
        boxSizing: "border-box",
        borderRadius: 8,
        color: "white",
        padding: isMobile ? "2px 5px 2px 5px" : "10px 20px 10px 20px",
        fontSize: isMobile ? 12 : 16

    },
    gridTitle: {
        fontSize: 20
    },
    listGridItem: {
        width: 370
    },
    list: {
        width: '100%',
        maxWidth: isMobile ? 200 : 370,
        // backgroundColor: theme.palette.background.paper,
        position: 'relative',
        overflow: 'auto',
        maxHeight: isMobile ? 300 : 500,

        /* Rectangle 3173 */

        background: '#181728',
        borderRadius: 8
    },
    noResults: {
        textAlign: "center",
        marginTop: 50,
        color: 'darkgray',
        fontSize: 18
    },
    mobileText: {
        fontSize: 11,
        width: "100%"
    },
    regular: {
        width: "100%",
    }

}))

interface props {
    networkName: string
    weth10Address: string
    scarcityAddress: string
    show: boolean
    setShow: (show: boolean) => void,
    mobile: boolean
    setAddress: (a: string) => void

}

interface MenuToken {
    name: string
    address: string
    image: string,
    loading: boolean,
    balance: number
}

interface TokenMetadata {
    name: string
    address: string
}
const randomInt = (range: number) => Math.floor(Math.random() * range)
const trunc = (str: string, max: number) => {
    if (str.length > max) {
        return str.substring(0, max) + "..."
    }
    return str;
}
export default function Menu(props: props) {
    const tokenList: TokenMetadata[] = tokenListJSON[props.networkName].filter(
        (t) => t.name !== "WBTC" && t.name !== "BAT"
    );
    const indexOfWeth = tokenList.findIndex((item) => item.name.toLowerCase().indexOf("weth") !== -1);
    const indexOfScarcityAddress = tokenList.findIndex((item) => item.name.toLowerCase().indexOf("scarcity") !== -1);
    const behodler2Weth = props.weth10Address;

    let tokenDropDownList: MenuToken[] = tokenList.map((t, i) => {
        let item: MenuToken = { ...t, image: Images[i], loading: randomInt(2) ? true : false, balance: randomInt(100000) / 100 }
        if (i === indexOfWeth) {
            item.name = 'Eth'
            item.address = behodler2Weth
        }
        if (i === indexOfScarcityAddress) {
            item.address = props.scarcityAddress
        }
        return item
    })

    return <TokenPopup tokens={tokenDropDownList} open={props.show} setShow={props.setShow} mobile={props.mobile} setAddress={props.setAddress} />
}

function TokenPopup(props: { tokens: MenuToken[], open: boolean, setShow: (show: boolean) => void, mobile: boolean, setAddress: (a: string) => void }) {
    const classes = useStyles(props.mobile)();
    const close = () => props.setShow(false)
    const [searchText, setSearchText] = useState("")
    const [filteredList, setFilteredList] = useState<MenuToken[]>(props.tokens)

    useEffect(() => {
        setFilteredList(props.tokens.filter(t => t.name.toLowerCase().indexOf(searchText.toLowerCase()) !== -1))
    }, [searchText])

    return <Modal

        open={props.open === true}
        onClose={close}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"

    >
        <div className={classes.root}>
            <Grid
                container
                direction="column"
                justify="flex-start"
                alignItems="flex-start"
                spacing={3}
                className={classes.grid}
            >
                <Grid item className={classes.gridTitle}>
                    Select a token
                </Grid>
                <Grid item>
                    <input className={classes.search} type="text" placeholder="search name or paste address" value={searchText} onChange={(event) => setSearchText(event.target.value)} />
                </Grid>
                <Grid item className={classes.listGridItem}>
                    {filteredList.length === 0 ? <div className={classes.noResults}>No results found.</div> : <List className={classes.list}>
                        {filteredList.map((t, i) => <ListItem button key={i} onClick={() => {
                            props.setShow(false)
                            alert('settingAddresss ' + t.address)
                            props.setAddress(t.address)
                        }}>
                            <ListItemIcon>
                                <img width={props.mobile ? 24 : 32} src={t.image} alt={t.name} />
                            </ListItemIcon>
                            <div className={props.mobile ? classes.mobileText : classes.regular}>
                                <Grid
                                    container
                                    direction="row"
                                    justify="space-between"
                                    alignItems="center"
                                    spacing={1}
                                >

                                    <Grid item>
                                        {trunc(t.name, props.mobile ? 10 : 20)}
                                    </Grid>

                                    <Grid item>
                                        {t.loading ? <CircularProgress size={props.mobile ? 30 : 40} /> : t.balance}
                                    </Grid>
                                </Grid>
                            </div>
                            {/* <ListItemText primary={t.name} /> */}
                        </ListItem>)}
                    </List>}
                </Grid>
            </Grid>
        </div>
    </Modal>
}