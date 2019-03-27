import * as React from 'react'
import { List, ListItem, ListItemIcon, ListItemText, Divider } from '@material-ui/core';
import ArrowForward from '@material-ui/icons/ArrowForward'
import ArrowDownward from '@material-ui/icons/ArrowDownward'

interface AdminSectionProps{

}

class AdminSectionComponent extends React.Component<AdminSectionProps, any>{
	render(){
		return (<List>
			<ListItem button key="dependencies">
					<ListItemIcon><ArrowForward color="secondary" /></ListItemIcon>
					<ListItemText primary="Set Dependencies" />
			</ListItem>
			<Divider />
			<ListItem button key="redeem">
					<ListItemIcon><ArrowDownward color="secondary" /></ListItemIcon>
					<ListItemText primary="Withdraw Donations" />
			</ListItem>
			<Divider />	
		</List>)
	}
}

export const AdminSection = AdminSectionComponent