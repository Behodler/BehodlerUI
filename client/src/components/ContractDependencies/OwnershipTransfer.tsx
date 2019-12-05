import * as React from 'react'
import { useState, useEffect } from 'react'
import { Grid, TextField, Button, FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import API from '../../blockchain/ethereumAPI'

interface props{
	walletAddress
}

export default function (props:props) {
	const [contractAddress, setContractAddress] = useState<string>(API.Contracts.VersionController.address)
	const [newOwner, setNewOwner] = useState<string>("")
	const [primaryAddress, setPrimaryAddress] = useState<string>("")

	let handleChange = (event) => {
		setContractAddress(event.target.value as string)
	
	}
	const getPrimaryAddress = async()=>{
		switch (contractAddress) {
			case API.Contracts.PRE.address:
				return await API.Contracts.PRE.primary.call({from:props.walletAddress})
			case API.Contracts.PotReserve.address:
					return await API.Contracts.PotReserve.primary.call({from:props.walletAddress})
			case API.Contracts.WeiDai.address:
					return await API.Contracts.WeiDai.primary.call({from:props.walletAddress})
			case API.Contracts.WeiDaiBank.address:
					return await API.Contracts.WeiDaiBank.primary.call({from:props.walletAddress})
			case API.Contracts.VersionController.address:
					return await API.Contracts.VersionController.primary.call({from:props.walletAddress})
		}
	}

	useEffect(()=>{
	  getPrimaryAddress().then(result=>{
		setPrimaryAddress(result)
	  })
	})

	let updateOwner = async () => {
		switch (contractAddress) {
			case API.Contracts.PRE.address:
				await API.Contracts.PRE.transferPrimary(newOwner).send({from:props.walletAddress})
			case API.Contracts.PotReserve.address:
				await API.Contracts.PotReserve.transferPrimary(newOwner).send({from:props.walletAddress})
			case API.Contracts.WeiDai.address:
				await API.Contracts.WeiDai.transferPrimary(newOwner).send({from:props.walletAddress})
			case API.Contracts.WeiDaiBank.address:
				await API.Contracts.WeiDaiBank.transferPrimary(newOwner).send({from:props.walletAddress})
			case API.Contracts.VersionController.address:
				await API.Contracts.VersionController.transferPrimary(newOwner).send({from:props.walletAddress})
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
						<MenuItem value={API.Contracts.PRE.address}>PRE</MenuItem>
						<MenuItem value={API.Contracts.PotReserve.address}>Pot Reserve</MenuItem>
						<MenuItem value={API.Contracts.WeiDai.address}>WeiDai</MenuItem>
						<MenuItem value={API.Contracts.WeiDaiBank.address}>Bank</MenuItem>
						<MenuItem value={API.Contracts.VersionController.address}>Version Controller</MenuItem>
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

