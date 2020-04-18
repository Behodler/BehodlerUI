import * as React from 'react'
import { useState, useContext, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import Search from '@material-ui/icons/Search'
import ExpandMoreRoundedIcon from '@material-ui/icons/ExpandMoreRounded';
import {
  FormControl,/* InputLabel, Select,*/ ListItemText, ListItem, ListItemAvatar,
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
import { isNullOrWhiteSpace } from '../../../../../util/jsHelpers'
import { Images } from './ImageLoader'
import { WalletContext } from "../../../../Contexts/WalletStatusContext"
import API from '../../../../../blockchain/ethereumAPI'
interface DropDownField {
  name: string,
  address: string,
  image: any
}

interface props {
  label: string
  dropDownFields: DropDownField[],
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

  const [selectedAddress, setSelectedAddress] = useState<string>(props.dropDownFields[0].address)
  const indexOfAddress = (address: string) => props.dropDownFields.findIndex(t => t.address == address)
  const nameOfSelectedAddress = (address: string) => props.dropDownFields.filter(t => t.address == address)[0].name
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [filteredText, setFilteredText] = useState<string>("")

  const [currentBalance, setCurrentBalance] = useState<string>("0.0")

  useEffect(() => {
    API.getBalanceOfToken(selectedAddress, walletContextProps.account).then(balance => setCurrentBalance(API.fromWei(balance))).catch(() => setCurrentBalance("-"))
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
                onClick={() => { setSelectedAddress(t.address); setDialogOpen(false) }}>
                <ListItemAvatar>
                  <img alt="Remy Sharp" src={t.image} width="32" />
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
                className={classes.input}
                placeholder="0.0"
              />
            </Grid>
            <Grid item>
              <FormControl>
                <Button

                  className={classes.button}
                  startIcon={<img src={Images[indexOfAddress(selectedAddress)]} width="32" />}
                  endIcon={<ExpandMoreRoundedIcon />}
                  onClick={() => setDialogOpen(true)}
                >
                  {nameOfSelectedAddress(selectedAddress)}
                </Button>
              </FormControl>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  </div>
  );
}
