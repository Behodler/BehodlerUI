import * as React from 'react'
import { useState, useEffect } from 'react'
import { Grid, Checkbox, TextField, Button, Select, MenuItem, InputLabel, FormControl } from '@material-ui/core';
import API from '../../blockchain/ethereumAPI'

interface contractGroup {
	weiDai: string
	dai: string
	patienceRegulationEngine: string
	weiDaiBank: string
	enabled: boolean
	name: string
	claimWindowsPerAdjustment: number
	donationAddress: string
	version: number
	originalValues?: contractGroup
}

const emptyGroup: contractGroup = {
	weiDai: "loading...",
	dai: "loading...",
	patienceRegulationEngine: "loading...",
	weiDaiBank: "loading...",
	enabled: false,
	name: "loading...",
	claimWindowsPerAdjustment: 0,
	donationAddress: "loading...",
	version: 0
}

interface props {
	walletAddress: string,
	children?: any
}

export default function (props: props) {
	const options = { from: props.walletAddress }
	if (props.walletAddress === '0x0')
		return <div></div>
	const [refresh, setRefresh] = useState<number>(0)
	const [oldRefresh, setOldRefresh] = useState<number>(-1)
	const [activeVersion, setActiveVersion] = useState<string>(API.activeVersion)
	const [oldActiveVesion, setOldActiveVersion] = useState<string>(activeVersion)
	const [versionArray, setVersionArray] = useState<string[]>([])
	const [defaultVersion, setDefaultVersion] = useState<string>("")
	const [group, setGroup] = useState<contractGroup>(emptyGroup)

	useEffect(() => {
		const loadData = async () => {
			setActiveVersion(API.activeVersion)
			if (oldActiveVesion !== activeVersion) {
				setOldActiveVersion(API.activeVersion)
				location.reload()
			}

			let empty = false
			let vArray: string[] = []
			for (let versions: number = 1; !empty; versions++) {
				const versionString = "" + versions;
				const weiDaiAddress = await API.Contracts.VersionController.getWeiDai(versionString).call(options)
				if (weiDaiAddress === "0x0000000000000000000000000000000000000000") {
					empty = true;
					setVersionArray(vArray)
				}
				vArray.push(versionString)
			}

			let version = 1;
			const defaultVersionHex = await API.Contracts.VersionController.getDefaultVersion().call(options)
			setDefaultVersion(""+API.hexToNumber(defaultVersionHex))
			const weiDaiAddress = await API.Contracts.VersionController.getWeiDai(activeVersion).call(options)

			const daiAddress = await API.Contracts.VersionController.getDai(activeVersion).call(options)
			const preAddress = await API.Contracts.VersionController.getPRE(activeVersion).call(options)
			const bankAddress = await API.Contracts.VersionController.getWeiDaiBank(activeVersion).call(options)
			const groupNameBytes: string = await API.Contracts.VersionController.getContractFamilyName(activeVersion).call(options)
			let groupName = ""
			for (let i = 0; i < groupNameBytes.length; i++) {
				if (groupNameBytes.charCodeAt(i) !== 0)
					groupName += groupNameBytes.charAt(i)
			}
			const claimWindowsPerAdjustment = await API.Contracts.PRE.getClaimWindowsPerAdjustment().call(options)
			const donationAddress = await API.Contracts.WeiDaiBank.getDonationAddress().call(options)
			const enabled = await API.Contracts.VersionController.isEnabled(activeVersion).call(options)

			const contractGroup: contractGroup = {
				weiDai: weiDaiAddress,
				dai: daiAddress,
				weiDaiBank: bankAddress,
				name: groupName,
				patienceRegulationEngine: preAddress,
				claimWindowsPerAdjustment,
				donationAddress,
				enabled,
				version,
				originalValues: {
					weiDai: weiDaiAddress,
					dai: daiAddress,
					weiDaiBank: bankAddress,
					name: groupName,
					patienceRegulationEngine: preAddress,
					claimWindowsPerAdjustment,
					donationAddress,
					enabled,
					version
				}
			}
			setGroup(contractGroup)


		}
		if (oldRefresh !== refresh) {
			setOldRefresh(refresh)
			loadData()
		}
	})

	const updateWeiDai = (newValue: string) => {
		group.weiDai = newValue
		const newGroup = { ...group }
		setGroup(newGroup)
	}

	const updateDai = (newValue: string) => {
		group.dai = newValue
		const newGroup = { ...group }
		setGroup(newGroup)
	}

	const updateBank = (newValue: string) => {
		group.weiDaiBank = newValue
		const newGroup = { ...group }
		setGroup(newGroup)
	}

	const updateClaimWindowsPerAdjustment = (newValue: string) => {
		const num = parseFloat(newValue)
		if (!isNaN(num)) {

			group.claimWindowsPerAdjustment = num
			const newGroup = { ...group }
			setGroup(newGroup)
		}
	}

	const updateDonationAddress = (newValue: string) => {
		group.donationAddress = newValue
		const newGroup = { ...group }
		setGroup(newGroup)
	}

	const updateEnabled = (newValue: boolean) => {
		group.enabled = newValue
		const newGroup = { ...group }
		setGroup(newGroup)
	}

	const updateName = (newValue: string) => {
		if (newValue.length <= 16) {
			group.name = newValue
			const newGroup = { ...group }
			setGroup(newGroup)
		}
	}

	const updatePatienceRegulationEngine = (newValue: string) => {
		group.patienceRegulationEngine = newValue
		const newGroup = { ...group }
		setGroup(newGroup)
	}

	const updateRow = () => {
		const currentGroup = group
		const originalValues = currentGroup.originalValues || null;
		if (originalValues === null)
			return;
		if (currentGroup.claimWindowsPerAdjustment !== originalValues.claimWindowsPerAdjustment) {
			API.Contracts.PRE.setClaimWindowsPerAdjustment("" + currentGroup.claimWindowsPerAdjustment).send(options)
		}
		if (currentGroup.donationAddress !== originalValues.donationAddress) {
			API.Contracts.WeiDaiBank.setDonationAddress(currentGroup.donationAddress).send(options)
		}

		if (currentGroup.dai !== originalValues.dai || currentGroup.weiDai !== originalValues.weiDai || currentGroup.patienceRegulationEngine !== originalValues.patienceRegulationEngine ||
			currentGroup.version !== originalValues.version || currentGroup.weiDaiBank !== originalValues.weiDaiBank ||
			currentGroup.name !== originalValues.name) {
			API.Contracts.VersionController.setContractGroup("" + currentGroup.version, currentGroup.weiDai, currentGroup.dai,
				currentGroup.patienceRegulationEngine, currentGroup.weiDaiBank, currentGroup.name).send(options)
		}

		if (currentGroup.enabled !== originalValues.enabled) {
			API.Contracts.VersionController.setEnabled("" + originalValues.version, currentGroup.enabled).send(options)
		}

	}


	return <Grid container
		direction="column"
		alignContent="center"
		justify="flex-start"
		spacing={3}>
		<Grid>
			<Button variant="contained" color="secondary" onClick={() => { setRefresh(refresh + 1); setGroup(emptyGroup); }}>Refresh Page</Button>
		</Grid>
		<Grid item>
			<Grid container
				direction="row"
				alignItems="flex-start"
				justify="space-evenly"
				spacing={3}>
				<Grid item><TextField label="WeiDai" value={group.weiDai} onChange={(event) => { updateWeiDai(event.target.value) }} /></Grid>
				<Grid item><TextField label="Dai" value={group.dai} onChange={(event => { updateDai(event.target.value) })} /></Grid>
				<Grid item><TextField label="PRE" value={group.patienceRegulationEngine} onChange={(event => { updatePatienceRegulationEngine(event.target.value) })} /></Grid>
				<Grid item><TextField label="Bank" value={group.weiDaiBank} onChange={(event => { updateBank(event.target.value) })} /></Grid>
				<Grid item><TextField label="Name" value={group.name} onChange={(event => { updateName(event.target.value) })} /></Grid>
				<Grid item><TextField label="DonationAddress" value={group.donationAddress} onChange={(event => { updateDonationAddress(event.target.value) })} /></Grid>
				<Grid item><TextField label="ClaimWindowsPerAdjustment" value={group.claimWindowsPerAdjustment} onChange={(event => { updateClaimWindowsPerAdjustment(event.target.value) })} /></Grid>
				<Grid item><Checkbox checked={group.enabled} onChange={(event => { updateEnabled(event.target.checked) })}></Checkbox>Enabled</Grid>
				<Grid item><Button color="primary" variant="contained" onClick={() => updateRow()}>Update row</Button>
				</Grid>
			</Grid>
		</Grid>
		<Grid item>
			<Grid container
				direction="row"
				alignItems="center"
				justify="flex-start"
				spacing={7}>
				<Grid item>
					<FormControl>
						<InputLabel htmlFor="active-version">Active version</InputLabel>
						<Select
							value={activeVersion}
							inputProps={{
								name: "activeVersionDropDown",
								id: "active-version"
							}}
							onChange={(event: React.ChangeEvent<{ name?: string; value: string }>) => { setActiveVersion(event.target.value) }}
						>
							{
								versionArray.map((version: string) => (
									<MenuItem value={version}>{version}</MenuItem>
								))
							}
						</Select>
					</FormControl>
				</Grid>
				<Grid item>
					<Button color="primary" variant="contained" onClick={async () => {
						await API.Contracts.VersionController.setActiveVersion(activeVersion).send(options)
					}}>Set Active Version for this User</Button>
				</Grid>
			</Grid>
			<Grid item>
				<Grid container
					direction="row"
					alignItems="center"
					justify="flex-start"
					spacing={7}>
					<Grid item>
						<FormControl>
							<InputLabel htmlFor="default-version">Default version</InputLabel>
							<Select
								value={defaultVersion}
								inputProps={{
									name: "defaultVersionDropDown",
									id: "default-version"
								}}
								onChange={(event: React.ChangeEvent<{ name?: string; value: string }>) => { setDefaultVersion(event.target.value) }}
							>
								{
									versionArray.map((version: string) => (
										<MenuItem value={version}>{version}</MenuItem>
									))
								}
							</Select>
						</FormControl>
					</Grid>
					<Grid item>
						<Button color="primary" variant="contained" onClick={async () => {
							await API.Contracts.VersionController.setDefaultVersion(defaultVersion).send(options)
						}}>Set Default Version for this User</Button>
					</Grid>
				</Grid>
			</Grid>
			<Grid item>
				<Button color="secondary" variant="contained">Add a new group</Button>
			</Grid>
		</Grid>
	</Grid>
}