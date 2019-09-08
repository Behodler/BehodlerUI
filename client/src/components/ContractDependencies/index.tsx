import * as React from 'react'
import { useState, useEffect } from 'react'
import { Grid, Checkbox, TextField, Button } from '@material-ui/core';
import API from '../../blockchain/ethereumAPI'

interface contractGroup {
	weiDai: string
	dai: string
	patienceRegulationEngine: string
	weiDaiBank: string
	enabled: boolean
	isDefault: boolean
	name: string
	claimWindowsPerAdjustment: number
	donationAddress: string
}

interface props {
	walletAddress: string,
	children?: any
}

export default function (props: props) {
	if (props.walletAddress === '0x0')
		return <div></div>
	const [refresh, setRefresh] = useState<number>(0)
	const [oldRefresh, setOldRefresh] = useState<number>(-1)

	const [groups, setGroups] = useState<contractGroup[]>([])

	useEffect(() => {
		const loadData = async () => {
			const options = { from: props.walletAddress }
			let version = 1;
			const defaultVersionHex = await API.Contracts.VersionController.getDefaultVersion().call(options)
			const defaultVersion: number = API.hexToNumber(defaultVersionHex)
			let empty = false;
			for (; !empty; version++) {
				const versionString = `${version}`
				const weiDaiAddress = await API.Contracts.VersionController.getWeiDai(versionString).call(options)
				if (weiDaiAddress === '0x0000000000000000000000000000000000000000')
					empty = true;
				else {
					const daiAddress = await API.Contracts.VersionController.getDai(versionString).call(options)
					const preAddress = await API.Contracts.VersionController.getPRE(versionString).call(options)
					const bankAddress = await API.Contracts.VersionController.getWeiDaiBank(versionString).call(options)
					const groupNameBytes: string = await API.Contracts.VersionController.getContractFamilyName(versionString).call(options)
					let groupName = ""
					for (let i = 0; i < groupNameBytes.length; i++) {
						if (groupNameBytes.charCodeAt(i) !== 0)
							groupName += groupNameBytes.charAt(i)
					}
					const claimWindowsPerAdjustment = await API.Contracts.PRE.getClaimWindowsPerAdjustment().call(options)
					const donationAddress = await API.Contracts.WeiDaiBank.getDonationAddress().call(options)
					const isDefault: boolean = defaultVersion == version
					const enabled = await API.Contracts.VersionController.isEnabled(versionString).call(options)

					const contractGroup: contractGroup = {
						weiDai: weiDaiAddress,
						dai: daiAddress,
						weiDaiBank: bankAddress,
						name: groupName,
						patienceRegulationEngine: preAddress,
						claimWindowsPerAdjustment,
						donationAddress,
						isDefault,
						enabled
					}
					const newGroups = [...groups, contractGroup]
					setGroups(newGroups)
				}
			}
		}
		if (oldRefresh !== refresh) {
			setOldRefresh(refresh)
			loadData()
		}
	})

	const updateWeiDai = (index: number, newValue: string) => {
		groups[index].weiDai = newValue
		setGroups([...groups])
	}

	const updateDai = (index: number, newValue: string) => {
		groups[index].dai = newValue
		setGroups([...groups])
	}

	const updateBank = (index: number, newValue: string) => {
		groups[index].weiDaiBank = newValue
		setGroups([...groups])
	}

	const updateClaimWindowsPerAdjustment = (index: number, newValue: string) => {
		const num = parseFloat(newValue)
		if (!isNaN(num)) {

			groups[index].claimWindowsPerAdjustment = num
			setGroups([...groups])
		}
	}

	const updateDonationAddress = (index: number, newValue: string) => {
		groups[index].donationAddress = newValue
		setGroups([...groups])
	}

	const updateEnabled = (index: number, newValue: boolean) => {
		groups[index].enabled = newValue
		setGroups([...groups])
	}

	const updateIsDefault = (index: number, newValue: boolean) => {
		groups[index].isDefault = newValue
		setGroups([...groups])
	}

	const updateName = (index: number, newValue: string) => {
		groups[index].name = newValue
		setGroups([...groups])
	}

	const updatePatienceRegulationEngine = (index: number, newValue: string) => {
		groups[index].patienceRegulationEngine = newValue
		setGroups([...groups])
	}

	return <Grid container
		direction="column"
		alignContent="center"
		justify="flex-start"
		spacing={3}>
		<Grid>
			<Button variant="contained" color="secondary" onClick={() => { setRefresh(refresh + 1); setGroups([]); }}>Refresh Page</Button>
		</Grid>
		{groups.map((group, index) => (
			<Grid key={index} item>
				<Grid container
					direction="row"
					alignItems="flex-start"
					justify="space-evenly"
					spacing={5}>
					<Grid key={"weiDai_" + index} item><TextField label="WeiDai" value={group.weiDai} onChange={(event) => { updateWeiDai(index, event.target.value) }} /></Grid>
					<Grid key={"dai_" + index} item><TextField label="Dai" value={group.dai} onChange={(event => { updateDai(index, event.target.value) })} /></Grid>
					<Grid key={"PRE_" + index} item><TextField label="PRE" value={group.patienceRegulationEngine} onChange={(event => { updatePatienceRegulationEngine(index, event.target.value) })} /></Grid>
					<Grid key={"Bank_" + index} item><TextField label="Bank" value={group.weiDaiBank} onChange={(event => { updateBank(index, event.target.value) })} /></Grid>
					<Grid key={"Name_" + index} item><TextField label="Name" value={group.name} onChange={(event => { updateName(index, event.target.value) })} /></Grid>
					<Grid key={"DonationAddress_" + index} item><TextField label="DonationAddress" value={group.donationAddress} onChange={(event => { updateDonationAddress(index, event.target.value) })} /></Grid>
					<Grid key={"Claim_" + index} item><TextField label="ClaimWindowsPerAdjustment" value={group.claimWindowsPerAdjustment} onChange={(event => { updateClaimWindowsPerAdjustment(index, event.target.value) })} /></Grid>
					<Grid key={"Enabled_" + index} item><Checkbox checked={group.enabled} onChange={(event => { updateEnabled(index, event.target.checked) })}></Checkbox>Enabled</Grid>
					<Grid key={"default_" + index} item><Checkbox checked={group.isDefault} onChange={(event => { updateIsDefault(index, event.target.checked) })}></Checkbox>isDefault</Grid>
					<Grid key={"update_" + index} item><Button color="primary" variant="contained">Update row</Button>
					</Grid>
				</Grid>
			</Grid>
		))}
		<Grid item>
			<Button color="secondary" variant="contained">Add a new group</Button>
		</Grid>
	</Grid>
}