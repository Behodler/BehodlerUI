import * as React from 'react'
import { List, ListItem, ListItemIcon, ListItemText, Divider } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add'
import Computer from '@material-ui/icons/Computer'
import CompareArrows from '@material-ui/icons/CompareArrows'
import Loop from '@material-ui/icons/Loop'
import TrendingUpIcon from '@material-ui/icons/TrendingUp';
import { Social } from '../../Social/index'
import QuestionAnswer from '@material-ui/icons/QuestionAnswer'
import { WalletContext } from '../../../Contexts/WalletStatusContext'

interface UserSectionProps {
	classes?: any,
	goToEngine: () => void
	homePage: () => void,
	goToBank: () => void
	behodlerSwap: () => void
	faq: () => void
	sisyphus: () => void
}

function UserSectionComponent(props: UserSectionProps) {
	const walletContextProps = React.useContext(WalletContext)
	return (<List>
		{walletContextProps.initialized ? <div><ListItem button key="create" onClick={props.goToEngine}>
			<ListItemIcon><AddIcon /></ListItemIcon>
			<ListItemText primary="Create / Claim" />
		</ListItem>
			<Divider />
			<ListItem button key="bank" onClick={props.goToBank}>
				<ListItemIcon><CompareArrows /></ListItemIcon>
				<ListItemText primary="Redeem for Dai" />
			</ListItem>
			<Divider />

		</div>
			: <div></div>
		}
		<ListItem button key="swap" onClick={props.behodlerSwap}>
			<ListItemIcon><Loop /></ListItemIcon>
			<ListItemText primary="Swap Tokens" />
		</ListItem>
		<Divider />
		<ListItem button key="sisyphus" onClick={props.sisyphus}>
			<ListItemIcon><TrendingUpIcon /></ListItemIcon>
			<ListItemText primary="Play Sisyphus" />
		</ListItem>
		<Divider />
		<ListItem button key="how" onClick={props.homePage}>
			<ListItemIcon><Computer /></ListItemIcon>
			<ListItemText primary="How it Works" />
		</ListItem>
		<Divider />
		<ListItem button key="thrift" onClick={props.faq}>
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