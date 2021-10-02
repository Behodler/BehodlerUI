import * as React from 'react'
import { useState, useContext, useEffect } from 'react'
import { makeStyles, withWidth } from '@material-ui/core'
import InputBase from '@material-ui/core/InputBase'
import Search from '@material-ui/icons/Search'
import ExpandMoreRoundedIcon from '@material-ui/icons/ExpandMoreRounded'

import {
    FormControl,
    ListItemText,
    ListItem,
    ListItemAvatar,
    Dialog,
    DialogTitle,
    Grid,
    TextField,
    Button,
    List,
    Container,
    DialogContentText,
    Typography,
    Box,
} from '@material-ui/core'
import { isNullOrWhiteSpace, formatNumberText, formatSignificantDecimalPlaces } from './jsHelpers'
import { WalletContext } from '../../../Contexts/WalletStatusContext'
import API from '../../../../blockchain/ethereumAPI'

interface DropDownField {
    name: string
    address: string
    image: any
}

interface exchangeRateFields {
    baseAddress: string
    ratio: string
    valid: boolean
    reserve?: string
    setReserve?: (r: string) => void
    baseName: string
}

interface props {
    label: string
    dropDownFields: DropDownField[]
    valid: boolean
    setValid: (v: boolean) => void
    setValue: (v: string) => void
    value: string
    setEnabled?: (e: boolean) => void
    setTokenAddress: (a: string) => void
    address: string
    exchangeRate?: exchangeRateFields
    scarcityAddress?: string
    clear: () => void
    disabledInput?: boolean
    enableCustomMessage?: string
    addressToEnableFor?: string
    disabledDropDown?: boolean
    liquidityMessage?: string
    decimalPlaces: number
    width: string,
    account:string
}
const scale = 8

const useStyles = makeStyles((theme) => ({
    extendedTextFieldRoot: {
        padding: '12px 20px 8px 20px',
        border: '1px solid #eee',
        borderRadius: 16,
        color:"white"
    },
    input: {
        width: '100%',
        color:"white"
    },
    inputError: {
        color: theme.palette.secondary.main,
    },
    balanceEnabled: {
        flex: 1,
        cursor: 'pointer',
    },
    balanceDisabled: {
        flex: 1,
    },
    searchHeader: {
        marginLeft: theme.spacing(1),
        flex: 1,
        width: Math.floor(15 * scale),
    },
    iconButton: {
        padding: 10,
    },
    divider: {
        height: 28,
        margin: 4,
    },
    buttonImage: {
        display: 'block',
        width: 24,
        height: 24,
    },
    search: {
        width: '500px',
        marginBottom: theme.spacing(2),
    },
    subfields: {
        color: 'white',
    },
    feeGrid: {
        paddingLeft: '20px',
    },
}))

function ExtendedTextField(props: props) {
    const classes = useStyles()
    const walletContextProps = useContext(WalletContext)
    const indexOfAddressFunc = (address: string) => props.dropDownFields.findIndex((t) => t.address.toLowerCase().trim() == address.toLowerCase().trim())
    const indexOfAddress = indexOfAddressFunc(props.address)

    const selectedImage = props.dropDownFields[indexOfAddress].image

    const nameOfSelectedAddress = props.dropDownFields[indexOfAddress].name || ''

    //const nameOfSelectedAddress = (address: string) => props.dropDownFields.filter(t => t.address.toLowerCase().trim() == address.toLowerCase().trim())[0].name
    const useEth = nameOfSelectedAddress.toLowerCase() === 'eth'

    const [dialogOpen, setDialogOpen] = useState<boolean>(false)
    const [filteredText, setFilteredText] = useState<string>('')
    const [currentBalance, setCurrentBalance] = useState<string>('0.0')
    const [enabled, setEnabled] = useState<boolean>(false)

    const setFormattedInput = (value: string) => {
        if (props.disabledInput) return
        if (isNullOrWhiteSpace(value)) {
            props.setValue('')
            props.setValid(true)
        }
        const formattedText = formatNumberText(value)
        props.setValue(value)
        const parsedValue = parseFloat(formattedText)
        const isValid = !isNaN(parsedValue) && parsedValue <= parseFloat(currentBalance)
        props.setValid(isValid)
    }

    let exchangeRateString = ''
    if (props.exchangeRate && props.exchangeRate.baseAddress !== '') {
        let ratio = formatSignificantDecimalPlaces(props.exchangeRate.ratio, 4)
        for (let i = 5; i < 19 && ratio === '0'; i++) {
            ratio = formatSignificantDecimalPlaces(props.exchangeRate.ratio, i)
        }

        if (props.exchangeRate.setReserve) exchangeRateString = `1 ${props.exchangeRate.baseName} = ${ratio} ${nameOfSelectedAddress}`
        else exchangeRateString = `1 ${nameOfSelectedAddress} = ${ratio}  ${props.exchangeRate.baseName}`
    }

    const currentTokenEffects = API.generateNewEffects(props.address, props.account, useEth, props.decimalPlaces)

    useEffect(() => {
        const effect = currentTokenEffects.allowance(props.account, props.addressToEnableFor || walletContextProps.contracts.behodler.Behodler.address)
        const subscription = effect.Observable.subscribe((allowance) => {
            const scaledAllowance = API.fromWei(allowance)
            const allowanceFloat = parseFloat(scaledAllowance)
            const balanceFloat = parseFloat(currentBalance)
            const en =
                (props.scarcityAddress !== undefined && props.address.trim().toLowerCase() === props.scarcityAddress.trim().toLowerCase()) ||
                /*useEth ||*/ !(isNaN(allowanceFloat) || isNaN(balanceFloat) || allowanceFloat < balanceFloat)
            setEnabled(en)
            if (props.setEnabled) {
                props.setEnabled(en)
            }
        })

        return () => {
            subscription.unsubscribe()
        }
    })

    useEffect(() => {
        const effect = currentTokenEffects.balanceOfEffect(props.account)
        const subscription = effect.Observable.subscribe((balance) => {
            setCurrentBalance(balance)
        })
        return () => {
            subscription.unsubscribe()
        }
    })

    useEffect(() => {
        if (props.exchangeRate && props.exchangeRate.setReserve) {
            const effect = currentTokenEffects.balanceOfTokenEffect(walletContextProps.contracts.behodler.Behodler2.Behodler2.address)
            const subscription = effect.Observable.subscribe((balance) => {
                if (props.exchangeRate && props.exchangeRate.setReserve) props.exchangeRate.setReserve(balance)
            })
            return () => {
                subscription.unsubscribe()
            }
        }
        return () => {}
    })

    const listTokens = isNullOrWhiteSpace(filteredText)
        ? props.dropDownFields
        : props.dropDownFields.filter((t) => t.name.toLowerCase().indexOf(filteredText.toLowerCase()) !== -1)

    const nameOfToken = nameOfSelectedAddress.toLowerCase()

    return (
        <>
            <Dialog fullWidth={true} open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogTitle>Select a token</DialogTitle>
                <Container maxWidth="xl">
                    <Grid container spacing={2} alignItems="center" justify="flex-start" direction="row">
                        <Grid item>
                            <Search />
                        </Grid>
                        <Grid item>
                            <FormControl fullWidth className={classes.search}>
                                <TextField id="input-with-icon-grid" label="Select a token" onChange={(event) => setFilteredText(event.target.value)} />
                            </FormControl>
                        </Grid>
                    </Grid>
                    {listTokens.length == 0 ? (
                        <DialogContentText>Token not found</DialogContentText>
                    ) : (
                        <List>
                            {listTokens.map((t) => (
                                <ListItem
                                    button
                                    key={t.address}
                                    alignItems="flex-start"
                                    onClick={() => {
                                        props.setTokenAddress(t.address)
                                        setDialogOpen(false)
                                        props.setValid(true)
                                        props.clear()
                                    }}
                                >
                                    <ListItemAvatar>
                                        <img alt="token" src={t.image} width="32" />
                                    </ListItemAvatar>
                                    <ListItemText primary={t.name} />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Container>
            </Dialog>
            <Box className={classes.extendedTextFieldRoot}>
                <Box mb={1} display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
                    <Box>
                        <Typography variant="body1">{props.label}</Typography>
                    </Box>
                    <Box>
                        <Typography
                            variant="body2"
                            className={props.disabledInput ? classes.balanceDisabled : classes.balanceEnabled}
                            onClick={() => setFormattedInput(currentBalance)}>
                            Balance: {formatSignificantDecimalPlaces(currentBalance, 4)}
                        </Typography>
                    </Box>
                </Box>
                <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
                    <Box flexGrow={1}>
                        <InputBase
                            className={`${classes.input} ${props.valid ? '' : classes.inputError}`}
                            placeholder="0"
                            value={props.width === "xs" ? formatSignificantDecimalPlaces(props.value, 5) : props.value} // shorten number length on mobile
                            onChange={(event) => setFormattedInput(event.target.value)}
                        />
                    </Box>
                    <Box>
                        <FormControl>
                            <Button
                                startIcon={<img className={classes.buttonImage} src={selectedImage} />}
                                endIcon={props.disabledDropDown ? '' : <ExpandMoreRoundedIcon />}
                                onClick={() => (props.disabledDropDown ? {} : setDialogOpen(true))}
                            >
                                {nameOfSelectedAddress}
                            </Button>
                            {enabled || props.setEnabled === undefined ? (
                                <div></div>
                            ) : (
                                <Button
                                    color="secondary"
                                    variant="outlined"
                                    onClick={async () =>
                                        await API.enableToken(
                                            props.address,
                                            props.account,
                                            props.addressToEnableFor || walletContextProps.contracts.behodler.Behodler.address
                                        )
                                    }
                                >
                                    {props.enableCustomMessage || 'Approve Token'}
                                </Button>
                            )}
                        </FormControl>
                    </Box>
                    {props.liquidityMessage ? (
                        <Grid item>
                            <Grid container direction="row" justify="space-between" alignItems="flex-start">
                                <Grid item>
                                    <Typography variant="caption" className={classes.subfields}>
                                        Scarcity to mint
                                    </Typography>
                                </Grid>
                                <Grid item>
                                    <Typography variant="caption" className={classes.subfields}>
                                        {props.liquidityMessage}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                    ) : (
                        ''
                    )}
                </Box>
                {nameOfToken === 'scarcity' || !props.exchangeRate || !props.exchangeRate.setReserve || !props.disabledInput ? (
                    ''
                ) : (
                    <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
                        <Box>
                            <Typography variant="caption" className={classes.subfields}>
                                Total in reserve
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" className={classes.subfields}>
                                {props.width === "xs"
                                    ? formatSignificantDecimalPlaces(
                                          (props.exchangeRate && props.exchangeRate.reserve) || "",
                                          5
                                      )
                                    : props.exchangeRate.reserve}
                            </Typography>
                        </Box>
                    </Box>
                )}
                {props.exchangeRate && props.exchangeRate.valid ? (
                    <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
                        <Box>
                            <Typography variant="caption" className={classes.subfields}>
                                {props.width === 'xs' ? 'Rate' : 'Exchange Rate'}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" className={classes.subfields}>
                                {exchangeRateString}
                            </Typography>
                        </Box>
                    </Box>
                ) : (
                    ''
                )}
            </Box>
        </>
    )
}

export default withWidth()(ExtendedTextField)
