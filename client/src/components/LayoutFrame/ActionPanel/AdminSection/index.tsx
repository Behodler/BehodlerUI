import * as React from 'react'
import { List, ListItem, ListItemIcon, ListItemText, Divider } from '@material-ui/core';
import ArrowForward from '@material-ui/icons/ArrowForward'
import ArrowDownward from '@material-ui/icons/ArrowDownward'
import API from '../../../../blockchain/ethereumAPI'
interface AdminSectionProps {
	walletAddress: string
	contractDependencies: ()=>void
}

function AdminSectionComponent(props: AdminSectionProps) {
	return (<List>
		<ListItem button key="dependencies" onClick = {props.contractDependencies}>
			<ListItemIcon><ArrowForward color="secondary" /></ListItemIcon>
			<ListItemText primary="Set Dependencies" />
		</ListItem>
		<Divider />
		<ListItem button key="withdraw" onClick={async () => {
			await API.Contracts.WeiDaiBank.withdrawDonations().send({ from: props.walletAddress })
		}}>
			<ListItemIcon><ArrowDownward color="secondary" /></ListItemIcon>
			<ListItemText primary="Withdraw Donations" />
		</ListItem>
		<Divider />
	</List>)
}

export const AdminSection = AdminSectionComponent