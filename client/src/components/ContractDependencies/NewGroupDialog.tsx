import * as React from 'react'
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { useState, useEffect } from 'react';
import { Grid } from '@material-ui/core';
import API from '../../blockchain/ethereumAPI'
import ButtonAdornedTextBox from '../Common/ButtonAdornedTextBox'
import { WalletContext } from '../Contexts/WalletStatusContext'
interface dialogProps {
	versionNumber: string
	isOpen: boolean
	submit: (weiDai: string, dai: string, pre: string, bank: string, name: string, version: string) => Promise<any>,
	close: () => void
}

export default function (props: dialogProps) {
	const walletContextProps = React.useContext(WalletContext)
	if(!walletContextProps.initialized)
	return <div></div>
	const [weiDai, setWeiDai] = useState<string>("");
	const [dai, setDai] = useState<string>("");
	const [patienceRegulationEngine, setpatienceRegulationEngine] = useState<string>("");
	const [weiDaiBank, setWeiDaiBank] = useState<string>("");
	const [name, setName] = useState<string>("");

	const handleChange = (event, func) => {
		func(event.target.value)
	}

	const handleNameChange = (event, func) => {
		const newValue = event.target.value
		if (newValue && newValue.length <= 16) {
			func(newValue)
		}
	}

	useEffect(() => {
		const subscription = API.newContractObservable.subscribe(contracts => {
			setWeiDai(contracts.weiDai)
			setWeiDaiBank(contracts.weiDaiBank)
			setpatienceRegulationEngine(contracts.PRE)
		})

		return function () {
			subscription.unsubscribe()
		}
	})

	return <Dialog
		open={props.isOpen}
		onClose={props.close}
	>
		<DialogTitle>Create new Contract Group</DialogTitle>
		<DialogContent>
			<Grid container
				alignItems="flex-start"
				direction="row"
				spacing={1}
				justify="center">
				<Grid key="popupWeiDai" item>
				<ButtonAdornedTextBox buttonEvent={async () => await API.generateNewContracts("weidai",walletContextProps.contracts,walletContextProps.account)} changeText={async (text: string) => await API.generateNewContracts("weidai",walletContextProps.contracts,walletContextProps.account,text)} label="WeiDai" text={weiDai} />
				</Grid>
				<Grid key="popupDai" item>
					<TextField label="Dai" onChange={(event) => handleChange(event, setDai)}></TextField>
				</Grid>
				<Grid key="popupPre" item>
				<ButtonAdornedTextBox buttonEvent={async () => await API.generateNewContracts("pre",walletContextProps.contracts,walletContextProps.account)} changeText={async (text: string) => await API.generateNewContracts("pre",walletContextProps.contracts,walletContextProps.account,text)} label="PRE" text={patienceRegulationEngine} />
				</Grid>
				<Grid key="popupBank" item>
					<ButtonAdornedTextBox buttonEvent={async () => await API.generateNewContracts("bank",walletContextProps.contracts,walletContextProps.account)} changeText={async (text: string) => await API.generateNewContracts("bank",walletContextProps.contracts,walletContextProps.account,text)} label="Bank" text={weiDaiBank} />
				</Grid>
				<Grid key="popupName" item>
					<TextField label="Name" onChange={(event) => handleNameChange(event, setName)}></TextField>
				</Grid>
			</Grid>
		</DialogContent>
		<DialogActions>
			<Button variant="contained" onClick={async () => {
				await props.submit(weiDai, dai, patienceRegulationEngine, weiDaiBank, name, props.versionNumber)
			}}>
				Create
			</Button>
			<Button variant="contained" color="secondary" onClick={props.close}>
				Cancel
			</Button>
		</DialogActions>
	</Dialog>
}