import * as React from 'react'
import { useState, useEffect } from 'react'
import { Grid, List, ListItem, ListItemIcon, makeStyles, Modal, Theme, CircularProgress } from '@material-ui/core';
import { formatSignificantDecimalPlaces } from '../jsHelpers'
import API from "../../../../../blockchain/ethereumAPI"
import { TokenInfo, emptyToken, rowsAtom } from '../../hooks/useTokenRows';
import { useAtom } from 'jotai';
import { mintingAtom } from '.';
import _ from 'lodash'

const useStyles = (isMobile: boolean) => makeStyles((theme: Theme) => ({
    root: {
        position: "absolute",
        width: isMobile ? 250 : 400,
        height: isMobile ? 500 : 671,
        left: isMobile ? 'calc(50% - 125px)' : 'calc(50% - 200px)',
        top: "10%",
        maxHeight: 'calc(100vh - 20%)',
        background: "#1B1A2D",
        borderRadius: 10,
    },
    grid: {
        color: "white",
        height: "100%",
        margin: 0,
        width: "100% !important"
    },
    search: {
        /* Rectangle 3172 */

        width: isMobile ? 225 : 345,
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
        width: "100%",
        maxHeight: 'calc(100% - 135px)',
    },
    list: {
        width: '100%',
        height: '100%',
        maxWidth: isMobile ? 250 : 350,
        // backgroundColor: theme.palette.background.paper,
        position: 'relative',
        overflow: 'auto',

        /* Rectangle 3173 */

        background: '#181728',
        borderRadius: 8

    },
    listItem: {
        height: 50
    },
    listItemMobile: {
        height: 40
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
        width: "100%"
    },
    modal: {

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
    input: boolean
}

interface MenuToken {
    name: string
    address: string
    image: string,
    balance: string,

}
//TODO: create a derived atom for tokensUnderConsideration as per chatGPT discussion. Let it rely on minting and input atoms.

const trunc = (str: string, max: number) => {
    if (str.length > max) {
        return str.substring(0, max) + "..."
    }
    return str;
}
const isNonZero = (balance: string) => BigInt(balance) > 0n


export default function Menu(props: props) {

    const [rows,] = useAtom(rowsAtom)
    const [minting,] = useAtom(mintingAtom)
    const [menuItems, setMenuItems] = useState<MenuToken[]>([])

    useEffect(() => {
        let tokensUnder = rows.map(r => r.base)
        if (minting && !props.input) {
            tokensUnder = rows.map(r => r.PV3)
        } else if (!minting && props.input) {
            tokensUnder = rows.map(r => isNonZero(r.PV2.balance) ? r.PV2 : r.PV3)
        }

        const filter = (token: TokenInfo, index: number, tokens: TokenInfo[]) => (
            tokens.find(t => t.address.toLowerCase() === token.address.toLowerCase()
            )
        )

        const getMenuItems = (balances: TokenInfo[]) => balances
            .filter(filter)
            .map((token: TokenInfo) => {
                const currentTokenListItem = filter(token, 0, tokensUnder) || emptyToken
                const item: MenuToken = {
                    address: currentTokenListItem.address,
                    name: currentTokenListItem?.name || '',
                    image: currentTokenListItem?.image || '',
                    balance: formatSignificantDecimalPlaces(API.fromWei(currentTokenListItem.balance), 4)
                }

                return item
            })

        const newMenuItems = getMenuItems(tokensUnder)

        if (!_.isEqual(newMenuItems, menuItems)) {
            setMenuItems(newMenuItems)
        }

    }, [rows, props.input, minting])

    return 3 < 4 ? <TokenPopup tokens={menuItems} open={props.show} setShow={props.setShow} mobile={props.mobile} setAddress={props.setAddress} />
        : <div></div>
}

function TokenPopup(props: { tokens: MenuToken[], open: boolean, setShow: (show: boolean) => void, mobile: boolean, setAddress: (a: string) => void }) {
    const classes = useStyles(props.mobile)();
    const close = () => props.setShow(false)
    const [searchText, setSearchText] = useState("")
    const [filteredList, setFilteredList] = useState<MenuToken[]>(props.tokens)

    useEffect(() => {
        var walletPattern = new RegExp(/^0x[a-fA-F0-9]{40}$/);
        const list = ((walletPattern.test(searchText)) ?
            props.tokens.filter(t => t.address.toLowerCase() === searchText.toLowerCase())
            : props.tokens.filter(t => t.name.toLowerCase().indexOf(searchText.toLowerCase()) !== -1)
        ).sort((left, right) => {
            return parseFloat(right.balance) - parseFloat(left.balance)
        })

        setFilteredList(list)
    }, [searchText, props.tokens])

    return <Modal
        open={props.open}
        onClose={close}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        className={classes.modal}
    >
        <div className={classes.root}>
            <Grid
                container
                direction="column"
                justifyContent="flex-start"
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
                        {filteredList.map((t, i) => <ListItem className={props.mobile ? classes.listItemMobile : classes.listItem} button key={i} onClick={() => {
                            props.setShow(false)
                            props.setAddress(t.address)
                        }}>
                            <ListItemIcon>
                                <img width={props.mobile ? 24 : 32} src={t.image} alt={t.name} />
                            </ListItemIcon>
                            <div className={props.mobile ? classes.mobileText : classes.regular}>
                                <Grid
                                    container
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    spacing={1}
                                >

                                    <Grid item>
                                        {trunc(t.name, props.mobile ? 10 : 24)}
                                    </Grid>

                                    <Grid item>
                                        {false ? <CircularProgress size={props.mobile ? 30 : 40} /> : t.balance}
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
