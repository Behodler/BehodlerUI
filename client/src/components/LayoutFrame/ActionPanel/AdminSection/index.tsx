import * as React from 'react'
import {useContext } from 'react'
import { WalletContext } from '../../../Contexts/WalletStatusContext'
import { List, ListItem, ListItemIcon, ListItemText, Divider } from '@material-ui/core';
import ArrowForward from '@material-ui/icons/ArrowForward'
import AccountBox from '@material-ui/icons/AccountBox'
import ArrowDownward from '@material-ui/icons/ArrowDownward'
interface AdminSectionProps {
	contractDependencies: ()=>void
	behodlerAdmin:()=>void
}

function AdminSectionComponent(props: AdminSectionProps) {
	const walletContextProps = useContext(WalletContext)
	return (<List>
		<ListItem button key="dependencies" onClick = {props.contractDependencies}>
			<ListItemIcon><ArrowForward color="secondary" /></ListItemIcon>
			<ListItemText primary="Set Dependencies" />
		</ListItem>
		<ListItem button key="beadmin" onClick = {props.behodlerAdmin}>
			<ListItemIcon><AccountBox color="primary" /></ListItemIcon>
			<ListItemText primary="Behodler Admin" />
		</ListItem>
		<Divider />
		<ListItem button key="withdraw" onClick={async () => {
			await walletContextProps.contracts.WeiDaiBank.withdrawDonations().send({ from: walletContextProps.account })
		}}>
			<ListItemIcon><ArrowDownward color="secondary" /></ListItemIcon>
			<ListItemText primary="Withdraw Donations" />
		</ListItem>
		<Divider />
	</List>)
}

export const AdminSection = AdminSectionComponent