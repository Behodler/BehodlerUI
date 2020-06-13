import * as React from 'react'
import { useState, useEffect, useContext, useCallback } from 'react'
import { WalletContext } from "../../../Contexts/WalletStatusContext"
import tokenListJSON from "../../../../blockchain/behodlerUI/baseTokens.json"
import { Images } from "../TradingBox/ImageLoader"
import BigNumber from 'bignumber.js'
import { Dialog, DialogTitle, Container, Button, Grid, Typography, } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import API from '../../../../blockchain/ethereumAPI'
import { ValueTextBox } from 'src/components/Common/ValueTextBox'

interface props {
    scarcityRequired: BigNumber
    open: boolean
    setDialogOpen: (open: boolean) => void
}

interface tokenCost {
    address: string,
    spend: string,
    balance: BigNumber,
    enabled: boolean
    scxGenerated: string
    invalid: boolean
}

interface tokenDropDownItem {
    name: string
    address: string,
    image: any
}

const useStyles = makeStyles({
    table: {
        fontSize: 11
    },
});

export default function BuyScarcityProxyDialog(props: props) {
    const classes = useStyles();
    const walletContextProps = useContext(WalletContext)
    const [tokenCosts, setTokenCosts] = useState<tokenCost[]>([])
    const [indexUpdated, setIndexUpdated] = useState<number>(-1)
    const [textUpdated, setTextUpdated] = useState<number>(0)
    const [tokenToEnable, setTokenToEnable] = useState<string>("")
    const [tokenEnabled, setTokenEnabled] = useState<number>(0)
    const [buyClicked, setBuyClicked] = useState<string>("")
    if (3 > 4) {
        setTokenCosts([])
    }
    BigNumber.config({ EXPONENTIAL_AT: 50, DECIMAL_PLACES: 18 })


    const tokenList: any[] = tokenListJSON[walletContextProps.networkName]
    const indexOfWeth = tokenList.findIndex(item => item.name.toLowerCase().indexOf('weth') !== -1)
    const avoidScarcityPredicate = t => t.name.toLowerCase().trim() !== 'scarcity'
    let scarcityAddress = ''
    let tokenDropDownList: tokenDropDownItem[] = tokenList.map((t, i): tokenDropDownItem => {
        let item: tokenDropDownItem = { ...t, image: Images[i] }
        if (i === indexOfWeth) {
            item.name = "Eth"
        }
        if (item.name.toLowerCase().trim() === 'scarcity')
            scarcityAddress = item.address
        return item
    }).filter(avoidScarcityPredicate)


    const getCost = (address: string): tokenCost => {
        const match = tokenCosts.filter(t => t.address === address)
        if (match.length > 0) {
            return match[0]
        }
        return { address: address, spend: "0", balance: new BigNumber(0), enabled: false, scxGenerated: "0", invalid: true }
    }

    const isEth = (name: string) => name.toLowerCase().trim() === 'eth'
    const decimalPlaces = (name: string) => name.toLowerCase().trim() === 'wbtc' ? 8 : 18

    const costCallBack = useCallback(async () => {
        let costs: tokenCost[] = [...tokenCosts]
        for (let i = 0; i < tokenDropDownList.length; i++) {
            const address = tokenDropDownList[i].address
            const balance: BigNumber = await API.getTokenBalance(address, walletContextProps.account, isEth(tokenDropDownList[i].name), decimalPlaces(tokenDropDownList[i].name))
            const allowance = await API.getTokenAllowance(address, walletContextProps.account, isEth(tokenDropDownList[i].name), decimalPlaces(tokenDropDownList[i].name), walletContextProps.contracts.behodler.Behodler.address)

            const enabled = allowance.isGreaterThanOrEqualTo(balance) && allowance.isGreaterThan(0)
            const indexOfExisting = tokenCosts.findIndex(t => t.address === address)
            const existing = getCost(address)
            if (indexOfExisting !== -1) {
                existing.balance = balance
                existing.enabled = enabled
                costs[indexOfExisting] = existing
            } else {
                costs.push({
                    address,
                    spend: "0",
                    balance,
                    enabled,
                    scxGenerated: "0",
                    invalid: true
                })
            }
        }
        setTokenCosts([...costs])
    }, [tokenEnabled])

    useEffect(() => {
        costCallBack()
    }, [tokenEnabled])

    const spendCallback = useCallback(async () => {
        if (indexUpdated === -1)
            return
        const tokenCost = tokenCosts[indexUpdated]
        if (!tokenCost.enabled)
            return;
        const nameOfToken = tokenDropDownList.filter(t => t.address === tokenCost.address)[0].name
        const bigSpend = new BigNumber(tokenCost.spend)
        const spendWei = bigSpend.isNaN() ? "0" : API.toWei(tokenCost.spend, decimalPlaces(nameOfToken))
        const generated = spendWei === "0" ? "0" : (await walletContextProps.contracts.behodler.Behodler.buyDryRun(tokenCost.address, spendWei, "0").call({ from: walletContextProps.account })).toString()

        if (generated !== tokenCost.scxGenerated) {
            tokenCost.scxGenerated = API.fromWei(generated);
            tokenCost.invalid = spendWei === '0'

        }

        tokenCosts[indexUpdated] = tokenCost
        setTokenCosts([...tokenCosts])

    }, [textUpdated])

    useEffect(() => {
        spendCallback()
    }, [textUpdated])

    const enableClickCallBack = useCallback(async () => {
        if (tokenToEnable !== '') {
            API.enableToken(tokenToEnable, walletContextProps.account, walletContextProps.contracts.behodler.Behodler.address, () => { setTokenEnabled(tokenEnabled + 1) })
        }
    }, [tokenToEnable])

    useEffect(() => {
        enableClickCallBack()
    }, [tokenToEnable])

    const buyCallBack = useCallback(async () => {
        if (buyClicked != '') {
            const cost = getCost(buyClicked)

            const name = tokenDropDownList.filter(t => t.address === cost.address)[0].name.toLowerCase().trim()
            const isEth = name === 'eth'
            const d = decimalPlaces(name)
            const spend = API.toWei(cost.spend.toString(), d)
            if (isEth) {
                walletContextProps.contracts.behodler.Janus.ethToToken(scarcityAddress, "0", '0').send({ from: walletContextProps.account, value: spend }, () => {
                    props.setDialogOpen(false)
                })
            } else {
                walletContextProps.contracts.behodler.Janus.tokenToToken(cost.address, scarcityAddress, spend, "0", "0").send({ from: walletContextProps.account }, () => {
                    props.setDialogOpen(false)
                })
            }
            setBuyClicked('')
        }
    }, [buyClicked])

    useEffect(() => {
        buyCallBack()
    }, [buyClicked])

    const scxString = props.scarcityRequired.decimalPlaces(4).toString()

    const setSpend = (address: string) => (spend: string) => {
        const indexOfToken = tokenCosts.findIndex(c => c.address.trim().toLowerCase() === address.trim().toLowerCase())
        if (indexOfToken !== -1) {
            tokenCosts[indexOfToken].spend = spend
            setTokenCosts([...tokenCosts])
        }
        setIndexUpdated(indexOfToken)
        setTextUpdated(textUpdated + 1)
    }
    return <Dialog fullWidth={true} open={props.open} onClose={() => props.setDialogOpen(false)} maxWidth="md">
        <DialogTitle>Buy Scarcity with tokens. {scxString} SCX needed to depose current Sisyphus</DialogTitle>
        <Container>
            <TableContainer component={Paper}>
                <Table className={classes.table} size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell align="center">Token</TableCell>
                            <TableCell align="center">Your Balance</TableCell>
                            <TableCell align="center">Tokens to spend</TableCell>
                            <TableCell align="center">Scx to generate</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tokenDropDownList.map(token => {
                            const cost = getCost(token.address)
                            return <TableRow key={token.name}>
                                <TableCell>
                                    <Grid
                                        container
                                        direction="column"
                                        justify="center"
                                        alignItems="center"
                                    >
                                        <Grid item>  <img src={token.image} width="24" /></Grid>
                                        <Grid item> <Typography variant="caption"> {token.name}</Typography></Grid>
                                    </Grid>
                                </TableCell >
                                <TableCell align="center">
                                    <Typography variant="caption"> {API.fromWei(cost.balance.toString())}</Typography>
                                </TableCell>
                                <TableCell align="center">
                                    <ValueTextBox text={cost.spend.toString()} placeholder={token.name} changeText={setSpend(token.address)} small />
                                </TableCell>
                                <TableCell align="center">{cost.scxGenerated}</TableCell>
                                <TableCell>
                                    {cost.enabled ? <Button variant="contained" color="secondary" onClick={() => setBuyClicked(token.address)} disabled={cost.invalid}>Buy</Button> :
                                        <Button color="secondary" variant="outlined" onClick={() => setTokenToEnable(token.address)}>
                                            ENABLE
                                        </Button>}
                                </TableCell>
                            </TableRow>
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    </Dialog>
} 