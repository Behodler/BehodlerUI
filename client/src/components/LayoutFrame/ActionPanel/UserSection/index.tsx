import * as React from 'react'
import { List, ListItem, ListItemIcon, ListItemText, Divider } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add'
import Computer from '@material-ui/icons/Computer'
import { Social } from '../../Social/index'
import QuestionAnswer from '@material-ui/icons/QuestionAnswer'

interface UserSectionProps {
	classes?: any,
	goToEngine: () => void
	homePage: () => void
}

function UserSectionComponent(props: UserSectionProps) {
	return (<List>
		<ListItem button key="create" onClick={props.goToEngine}>
			<ListItemIcon><AddIcon /></ListItemIcon>
			<ListItemText primary="Create / Redeem" />
		</ListItem>
		<Divider />
		<ListItem button key="how" onClick={props.homePage}>
			<ListItemIcon><Computer /></ListItemIcon>
			<ListItemText primary="How it Works" />
		</ListItem>
		<Divider />
		<ListItem button key="thrift">
			<ListItemIcon><QuestionAnswer /></ListItemIcon>
			<ListItemText primary="FAQ" />
		</ListItem>
		<Divider />
		<ListItem key="social">
			<Social />
		</ListItem>
	</List>)
}

export const UserSection = UserSectionComponent