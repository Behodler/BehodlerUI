import * as React from 'react'
import { useState, useEffect,useContext } from 'react'
import { Grid, TextField, Button, FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import { WalletContext } from '../Contexts/WalletStatusContext'

export default function () {
	const walletContextProps = useContext(WalletContext)
	const [contractAddress, setContractAddress] = useState<string>(walletContextProps.contracts.VersionController.address)
	const [newOwner, setNewOwner] = useState<string>("")
	const [primaryAddress, setPrimaryAddress] = useState<string>("")

	let handleChange = (event) => {
		setContractAddress(event.target.value as string)
	
	}
	const getPrimaryAddress = async()=>{
		switch (contractAddress) {
			case walletContextProps.contracts.PRE.address:
				return await walletContextProps.contracts.PRE.primary.call({from:walletContextProps.account})
			case walletContextProps.contracts.PotReserve.address:
					return await walletContextProps.contracts.PotReserve.primary.call({from:walletContextProps.account})
			case walletContextProps.contracts.WeiDai.address:
					return await walletContextProps.contracts.WeiDai.primary.call({from:walletContextProps.account})
			case walletContextProps.contracts.WeiDaiBank.address:
					return await walletContextProps.contracts.WeiDaiBank.primary.call({from:walletContextProps.account})
			case walletContextProps.contracts.VersionController.address:
					return await walletContextProps.contracts.VersionController.primary.call({from:walletContextProps.account})
		}
	}

	useEffect(()=>{
	  getPrimaryAddress().then(result=>{
		setPrimaryAddress(result)
	  })
	})

	let updateOwner = async () => {
		switch (contractAddress) {
			case walletContextProps.contracts.PRE.address:
				await walletContextProps.contracts.PRE.transferPrimary(newOwner).send({from:walletContextProps.account})
			case walletContextProps.contracts.PotReserve.address:
				await walletContextProps.contracts.PotReserve.transferPrimary(newOwner).send({from:walletContextProps.account})
			case walletContextProps.contracts.WeiDai.address:
				await walletContextProps.contracts.WeiDai.transferPrimary(newOwner).send({from:walletContextProps.account})
			case walletContextProps.contracts.WeiDaiBank.address:
				await walletContextProps.contracts.WeiDaiBank.transferPrimary(newOwner).send({from:walletContextProps.account})
			case walletContextProps.contracts.VersionController.address:
				await walletContextProps.contracts.VersionController.transferPrimary(newOwner).send({from:walletContextProps.account})
		}
	}

	return <div>
		<Divider variant="middle" />
		<Grid
			container
			direction="column"
			justify="center"
			alignItems="center"
			spacing={4}
		>
			<Grid item>
				<FormControl>
					<InputLabel id="demo-simple-select-label">Contracts</InputLabel>
					<Select
						value={contractAddress}
						onChange={handleChange}
					>
						<MenuItem value={walletContextProps.contracts.PRE.address}>PRE</MenuItem>
						<MenuItem value={walletContextProps.contracts.PotReserve.address}>Pot Reserve</MenuItem>
						<MenuItem value={walletContextProps.contracts.WeiDai.address}>WeiDai</MenuItem>
						<MenuItem value={walletContextProps.contracts.WeiDaiBank.address}>Bank</MenuItem>
						<MenuItem value={walletContextProps.contracts.VersionController.address}>Version Controller</MenuItem>
					</Select>
				</FormControl>
			</Grid>
			<Grid item>
				<TextField label="Current Owner" InputProps={{ readOnly: true }} value={primaryAddress}></TextField>
			</Grid>
			<Grid item>
				<TextField label="New Owner" value={newOwner} onChange={(e) => setNewOwner(e.target.value)}></TextField>
			</Grid>
			<Grid item>
				<Button variant="contained" color="primary" onClick={updateOwner}>Change Ownership</Button>
			</Grid>
		</Grid>
	</div>
}

