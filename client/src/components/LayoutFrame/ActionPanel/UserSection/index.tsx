import * as React from 'react'
import { List, ListItem, ListItemIcon, ListItemText, Divider } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add'
import AssignmentReturned from '@material-ui/icons/AssignmentReturned'
import Timeline from '@material-ui/icons/Timeline'
import Computer from '@material-ui/icons/Computer'
import QuestionAnswer from '@material-ui/icons/QuestionAnswer'
import {Social} from '../../Social/index'

interface UserSectionProps{

}

class UserSectionComponent extends React.Component<UserSectionProps, any>{
	render(){
		return (<List>
			<ListItem button key="create">
					<ListItemIcon><AddIcon/></ListItemIcon>
					<ListItemText primary="Create WeiDai" />
			</ListItem>
			<Divider />
			<ListItem button key="redeem">
					<ListItemIcon><AssignmentReturned /></ListItemIcon>
					<ListItemText primary="Redeem WeiDai" />
			</ListItem>
			<Divider />
			<ListItem button key="price">
					<ListItemIcon><Timeline /></ListItemIcon>
					<ListItemText primary="Price History" />
			</ListItem>
			<Divider />
			<ListItem button key="how">
					<ListItemIcon><Computer /></ListItemIcon>
					<ListItemText primary="How it Works" />
			</ListItem>
			<Divider />
			<ListItem button key="thrift">
					<ListItemIcon><QuestionAnswer /></ListItemIcon>
					<ListItemText primary="What's a Thriftcoin?" />
			</ListItem>
			<ListItem key = "social">
				<Social />
			</ListItem>
		</List>)
	}
}

export const UserSection = UserSectionComponent