import * as React from 'react'
import { useState, useContext, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
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
import { isNullOrWhiteSpace, formatNumberText } from '../../../../util/jsHelpers'
import { Images } from './ImageLoader'
import { WalletContext } from "../../../Contexts/WalletStatusContext"
import API from '../../../../blockchain/ethereumAPI'


interface DropDownField {
  name: string,
  address: string,
  image: any
}

interface props {
  label: string
  dropDownFields: DropDownField[],
  valid: boolean,
  setValid: (v: boolean) => void
  setValue: (v: string) => void
  value:string
  setEnabled?: (e: boolean) => void
  setTokenAddress: (a: string) => void
  address: string
}

const useStyles = makeStyles((theme) => ({
  root: {
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
    width: 800,
    backgroundColor: "rgb(32, 33, 36)"
  },

  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
    width: 400
  },
  inputError: {
    marginLeft: theme.spacing(1),
    flex: 1,
    width: 400,
    color: theme.palette.secondary.main
  },
  balance: {
    marginRight: theme.spacing(1),
    flex: 1
  },
  searchHeader: {
    marginLeft: theme.spacing(1),
    flex: 1,
    width: 400
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
}));

export default function ExtendedTextField(props: props) {
  const classes = useStyles();
  const walletContextProps = useContext(WalletContext)

  const indexOfAddress = (address: string) => props.dropDownFields.findIndex(t => t.address == address)
  const nameOfSelectedAddress = (address: string) => props.dropDownFields.filter(t => t.address == address)[0].name
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [filteredText, setFilteredText] = useState<string>("")
  const [currentBalance, setCurrentBalance] = useState<string>("0.0")
  const [enabled, setEnabled] = useState<boolean>(false)

  const setFormattedInput = (value: string) => {
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


  const currentTokenEffects = API.generateNewEffects(props.address, walletContextProps.account) 

  useEffect(() => {
    const effect = currentTokenEffects.allowance(walletContextProps.account, walletContextProps.contracts.behodler.Behodler.address)
    const subscription = effect.Observable.subscribe(allowance => {
      const scaledAllowance = API.fromWei(allowance)
      const allowanceFloat = parseFloat(scaledAllowance)
      const balanceFloat = parseFloat(currentBalance)
      const en = !(isNaN(allowanceFloat) || isNaN(balanceFloat) || allowanceFloat < balanceFloat)
      setEnabled(en)
      if (props.setEnabled)
        props.setEnabled(en)
    })

    return () => { subscription.unsubscribe(); effect.cleanup() }
  })

  useEffect(() => {
    const effect = currentTokenEffects.balanceOfEffect(walletContextProps.account)
    const subscription = effect.Observable.subscribe(balance => {
      setCurrentBalance(balance)
    })
    return () => { subscription.unsubscribe(); effect.cleanup() }
  })


  const listTokens = isNullOrWhiteSpace(filteredText) ? props.dropDownFields : props.dropDownFields.filter(t => t.name.toLowerCase().indexOf(filteredText.toLowerCase()) !== -1)

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
                onClick={() => { props.setTokenAddress(t.address); setDialogOpen(false); props.setValue(""); props.setValid(true) }}>
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
    <Paper component="form" className={classes.root} >
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
                variant="subtitle2"
                className={classes.searchHeader}
              >
                {props.label}
              </Typography>
            </Grid>
            <Grid>
              <Typography
                variant="subtitle2"
                className={classes.balance}
              >
                Balance: {currentBalance}
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
                  startIcon={<img src={Images[indexOfAddress(props.address)]} width="32" />}
                  endIcon={<ExpandMoreRoundedIcon />}
                  onClick={() => setDialogOpen(true)}
                >
                  {nameOfSelectedAddress(props.address)}
                </Button>
                {enabled || props.setEnabled===undefined ? <div></div> :
                  <Button color="secondary" variant="outlined" onClick={async () => await API.enableToken(props.address, walletContextProps.account, walletContextProps.contracts.behodler.Behodler.address)}>
                    Enable Token for Trade
                  </Button>}
              </FormControl>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  </div>
  );
}
