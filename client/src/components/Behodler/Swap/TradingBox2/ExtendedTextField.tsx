import * as React from 'react'
import { useState, useContext, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles';
import InputBase from '@material-ui/core/InputBase';
import Search from '@material-ui/icons/Search'
import ExpandMoreRoundedIcon from '@material-ui/icons/ExpandMoreRounded';

import {
  FormControl, ListItemText, ListItem, ListItemAvatar,
  Dialog,
  DialogTitle,
  Grid,
  TextField,
  Button,
  List,
  Container,
  DialogContentText,
  Typography,
} from '@material-ui/core';
import { isNullOrWhiteSpace, formatNumberText, formatDecimalStrings } from '../../../../util/jsHelpers'
import { WalletContext } from "../../../Contexts/WalletStatusContext"
import API from '../../../../blockchain/ethereumAPI'

interface DropDownField {
  name: string,
  address: string,
  image: any
}

interface exchangeRateFields {
  baseAddress: string
  ratio: string,
  valid: boolean,
  reserve?: string
  setReserve?: (r: string) => void
  baseName: string
}

interface props {
  label: string
  dropDownFields: DropDownField[],
  valid: boolean,
  setValid: (v: boolean) => void
  setValue: (v: string) => void
  value: string
  setEnabled?: (e: boolean) => void
  setTokenAddress: (a: string) => void
  address: string,
  exchangeRate?: exchangeRateFields,
  scarcityAddress?: string
  clear: () => void
  disabledInput?: boolean
  enableCustomMessage?: string,
  addressToEnableFor?: string
  disabledDropDown?: boolean
  liquidityMessage?: string
}
const scale = 8

const useStyles = makeStyles((theme) => ({
  extendedTextFieldRoot: {
    padding: '6px 8px',
    display: 'flex',
    alignItems: 'center',
    width: Math.floor(55 * scale),
    border: '2px solid #DFDFDF',
    borderRadius: 25
  },

  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
    width: Math.floor(23 * scale),
  },
  inputError: {
    marginLeft: theme.spacing(1),
    flex: 1,
    width: Math.floor(23 * scale),
    color: theme.palette.secondary.main,
  },
  balanceEnabled: {
    marginRight: theme.spacing(1),
    flex: 1,
    cursor: 'pointer'
  },
  balanceDisabled: {
    marginRight: theme.spacing(1),
    flex: 1,
  },
  searchHeader: {
    marginLeft: theme.spacing(1),
    flex: 1,
    width: Math.floor(15 * scale)
  },
  iconButton: {
    padding: 10,
  },
  divider: {
    height: 28,
    margin: 4,
  },
  button: {
    margin: theme.spacing(1),
  },
  search: {
    width: '500px',
    marginBottom: theme.spacing(2),
  },
  subfields: {
    color: "darkGrey"
  },
  feeGrid: {
    paddingLeft: "20px"
  }
}));

export default function ExtendedTextField(props: props) {
  const classes = useStyles();
  const walletContextProps = useContext(WalletContext)
  const indexOfAddressFunc = (address: string) => props.dropDownFields.findIndex(t => t.address.toLowerCase().trim() == address.toLowerCase().trim())
  const indexOfAddress = indexOfAddressFunc(props.address)
  const selectedImage = props.dropDownFields[indexOfAddress].image
  const nameOfSelectedAddress = (address: string) => props.dropDownFields.filter(t => t.address.toLowerCase().trim() == address.toLowerCase().trim())[0].name
  const useEth = nameOfSelectedAddress(props.address).toLowerCase() === 'eth'

  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [filteredText, setFilteredText] = useState<string>("")
  const [currentBalance, setCurrentBalance] = useState<string>("0.0")
  const [enabled, setEnabled] = useState<boolean>(useEth)

  const setFormattedInput = (value: string) => {
    if (props.disabledInput)
      return
    if (isNullOrWhiteSpace(value)) {
      props.setValue("")
      props.setValid(true)
    }
    const fomattedText = formatNumberText(value)
    props.setValue(value)
    const parsedValue = parseFloat(fomattedText)
    const isValid = !isNaN(parsedValue) && parsedValue <= parseFloat(currentBalance)
    props.setValid(isValid)
  }

  let exchangeRateString = ''
  if (props.exchangeRate && props.exchangeRate.baseAddress !== '') {
    let ratio = formatDecimalStrings(props.exchangeRate.ratio, 4)
    for (let i = 5; i < 19 && ratio === '0'; i++) {
      ratio = formatDecimalStrings(props.exchangeRate.ratio, i)
    }

    if (props.exchangeRate.setReserve)
      exchangeRateString = `1 ${props.exchangeRate.baseName} = ${ratio} ${nameOfSelectedAddress(props.address)}`
    else
      exchangeRateString = `1 ${nameOfSelectedAddress(props.address)} = ${ratio}  ${props.exchangeRate.baseName}`
  }


  const decimalPlaces = nameOfSelectedAddress(props.address).toLowerCase().indexOf('wbtc') !== -1 ? 8 : 18
  const currentTokenEffects = API.generateNewEffects(props.address, walletContextProps.account, useEth, decimalPlaces)

  useEffect(() => {
    const effect = currentTokenEffects.allowance(walletContextProps.account, props.addressToEnableFor || walletContextProps.contracts.behodler.Behodler.address)
    const subscription = effect.Observable.subscribe(allowance => {
      const scaledAllowance = API.fromWei(allowance)
      const allowanceFloat = parseFloat(scaledAllowance)
      const balanceFloat = parseFloat(currentBalance)
      const en = (props.scarcityAddress !== undefined && props.address.trim().toLowerCase() === props.scarcityAddress.trim().toLowerCase()) || useEth || !(isNaN(allowanceFloat) || isNaN(balanceFloat) || allowanceFloat < balanceFloat)
      setEnabled(en)
      if (props.setEnabled) {
        props.setEnabled(en)
      }
    })

    return () => { subscription.unsubscribe(); effect.cleanup() }
  })

  useEffect(() => {
    const effect = currentTokenEffects.balanceOfEffect(walletContextProps.account)
    const subscription = effect.Observable.subscribe(balance => {
      setCurrentBalance(balance)
    })
    return () => { subscription.unsubscribe(); effect.cleanup() }
  });

  useEffect(() => {
    if (props.exchangeRate && props.exchangeRate.setReserve) {
      const effect = currentTokenEffects.balanceOfTokenEffect(walletContextProps.contracts.behodler.Behodler2.Behodler2.address)
      const subscription = effect.Observable.subscribe(balance => {
        if (props.exchangeRate && props.exchangeRate.setReserve)
          props.exchangeRate.setReserve(balance)
      })
      return () => { subscription.unsubscribe(); effect.cleanup() }
    }
    return () => { }
  })

  const listTokens = isNullOrWhiteSpace(filteredText) ? props.dropDownFields : props.dropDownFields.filter(t => t.name.toLowerCase().indexOf(filteredText.toLowerCase()) !== -1)

  const nameOfToken = nameOfSelectedAddress(props.address).toLowerCase()

  return (<div>
    <Dialog fullWidth={true} open={dialogOpen} onClose={() => setDialogOpen(false)}>
      <DialogTitle>Select a token</DialogTitle>
      <Container maxWidth="xl">
        <Grid container spacing={2} alignItems="center" justify="flex-start" direction="row" >
          <Grid item>
            <Search />
          </Grid>
          <Grid item>
            <FormControl fullWidth className={classes.search}>
              <TextField id="input-with-icon-grid" label="Select a token" onChange={(event) => setFilteredText(event.target.value)} />
            </FormControl>
          </Grid>
        </Grid>
        {listTokens.length == 0 ? <DialogContentText>Token not found</DialogContentText> :
          <List>
            {listTokens.map(t => (
              <ListItem
                button
                key={t.address}
                alignItems="flex-start"
                onClick={() => { props.setTokenAddress(t.address); setDialogOpen(false); props.setValid(true); props.clear() }}>
                <ListItemAvatar>
                  <img alt="token" src={t.image} width="32" />
                </ListItemAvatar>
                <ListItemText
                  primary={t.name}
                />
              </ListItem>
            ))}
          </List>
        }
      </Container>
    </Dialog>
    <div className={classes.extendedTextFieldRoot} >
      <Grid container
        direction="column"
        justify="flex-start"
        alignItems="stretch">
        <Grid item>
          <Grid container
            direction="row"
            justify="space-between"
            alignItems="center"
          >
            <Grid item>
              <Typography
                variant="body1"
                className={classes.searchHeader}
              >
                {props.label.toUpperCase()}
              </Typography>
            </Grid>
            <Grid>
              <Typography
                variant="caption"
                className={props.disabledInput ? classes.balanceDisabled : classes.balanceEnabled}
                onClick={() => setFormattedInput(currentBalance)}
              >
                Balance: {formatDecimalStrings(currentBalance, 4)}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <Grid container
            direction="row"
            justify="space-between"
            alignItems="center">
            <Grid item>
              <InputBase
                className={props.valid ? classes.input : classes.inputError}
                placeholder="0.0"
                value={props.value}
                onChange={(event) => setFormattedInput(event.target.value)}
              />
            </Grid>
            <Grid item>
              <FormControl>
                <Button

                  className={classes.button}
                  startIcon={<img src={selectedImage} width="32" />}
                  endIcon={props.disabledDropDown ? "" : <ExpandMoreRoundedIcon />}
                  onClick={() => props.disabledDropDown ? {} : setDialogOpen(true)}
                >
                  {nameOfSelectedAddress(props.address)}
                </Button>
                {enabled || props.setEnabled === undefined ? <div></div> :
                  <Button color="secondary" variant="outlined" onClick={async () => await API.enableToken(props.address, walletContextProps.account, props.addressToEnableFor || walletContextProps.contracts.behodler.Behodler.address)}>
                    {props.enableCustomMessage || "Enable Token"}
                  </Button>}
              </FormControl>
            </Grid>

          </Grid>
          {props.exchangeRate && props.exchangeRate.valid ?
            <div>
              <Grid item>
                <Grid
                  container
                  direction="row"
                  justify="space-between"
                  alignItems="flex-start"
                >
                  <Grid item>
                    <Typography variant="caption" className={classes.subfields}>
                      Exchange Rate
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="caption" className={classes.subfields}>
                      {exchangeRateString}
                    </Typography>
                  </Grid>
                </Grid>

              </Grid>
            </div>
            : <div></div>}
          {nameOfToken === 'scarcity' || !props.exchangeRate || !props.exchangeRate.setReserve || !props.disabledInput ? "" :
            <Grid item>
              <Grid
                container
                direction="row"
                justify="space-between"
                alignItems="flex-start"
              >
                <Grid item>
                  <Typography variant="caption" className={classes.subfields}>
                    Total in reserve
                    </Typography>
                </Grid>
                <Grid item>
                  <Typography variant="caption" className={classes.subfields}>
                    {props.exchangeRate.reserve}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>}
          {props.liquidityMessage ? <Grid item>
            <Grid
              container
              direction="row"
              justify="space-between"
              alignItems="flex-start"
            >
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
            </Grid></Grid> : ""}
        </Grid>
      </Grid>
    </div>
  </div>
  );
}
