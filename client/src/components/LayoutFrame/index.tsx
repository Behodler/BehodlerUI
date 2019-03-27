import * as React from 'react'
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';
import { withStyles, Drawer, List, ListItem, Divider, ListItemIcon, ListItemText, Hidden, Grid } from '@material-ui/core';
import WeidaiLogo from './WeidaiLogo'

interface LayoutFrameProps {
	classes?: any
}

const width: number = 200;

let styleObject = {
	root: {
		display: 'flex',
	},
	actionDrawer: {
		minWidth: width,
		flexShrink: 0,
	},
	infoDrawer: {
		minWidth: width * 2,
		flexShrink: 0,
	},
	actionDrawerPaper: {
		minWidth: width
	},
	infoDrawerPaper: {
		minWidth: width * 2
	},
	content: {
		flexGrow: 1
	},
	heading: {
		fontSize: 40,
		fontFamily: 'Syncopate',
		margin:"10px 0 5px 0"
	},
	subheading:{
		fontSize:16,
		margin:"0px 0 5px 0"
	}
}


let styles = (theme: any) => styleObject

class LayoutFrameComponent extends React.Component<LayoutFrameProps, any>{

	constructor(props: LayoutFrameProps) {
		super(props)
	}


	render() {
		const { classes } = this.props
		return (
			<div className={classes.root}>
				<Hidden mdDown>
					<Drawer variant="permanent"
						className={classes.actionDrawer}
						classes={{ paper: classes.actionDrawerPaper }}
					>
						<List>
							{['Inbox', 'Starred', 'Send email', 'Drafts'].map((text, index) => (
								<ListItem button key={text}>
									<ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
									<ListItemText primary={text} />
								</ListItem>
							))}
						</List>
						<Divider />
						<List>
							{['All mail', 'Trash', 'Spam'].map((text, index) => (
								<ListItem button key={text}>
									<ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
									<ListItemText primary={text} />
								</ListItem>
							))}
						</List>
					</Drawer>
				</Hidden>
				<main className={classes.content}>
					<Grid
					container
					direction="row"
					justify="center"
					alignItems="center">
						<Grid item>
							<Grid 
							container
							direction="column"
							justify="center"
							alignItems="center"
							spacing={0}>
								<Grid item>
										<Grid 
										container
										direction="row"
										justify="space-evenly"
										alignItems="center"
										spacing={32}>
											<Grid item>
												<p className={classes.heading}>
														WEIDAI 
												</p>
											</Grid>
											<Grid item>
												<WeidaiLogo/>
											</Grid>
										</Grid>
								</Grid>
								<Grid item>
									<p className={classes.subheading}>
											THE WORLD'S FIRST THRIFTCOIN
									</p>
								</Grid>
							</Grid>
						</Grid>
					</Grid>
					<Divider variant="middle" />
					CONTENT
				</main>
				<Hidden mdDown>
					<Drawer variant="permanent" anchor="right"
						className={classes.infoDrawer}
						classes={{ paper: classes.infoDrawerPaper }}
					>
						<List>
							{['Globby', 'Stoppy', 'Drafts'].map((text, index) => (
								<ListItem button key={text}>
									<ListItemIcon>{index % 2 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
									<ListItemText primary={text} />
								</ListItem>
							))}
						</List>
						<Divider />
						<List>
							{['Hello', 'Trash', 'Spam'].map((text, index) => (
								<ListItem button key={text}>
									<ListItemIcon>{index % 3 === 0 ? <InboxIcon /> : <MailIcon />}</ListItemIcon>
									<ListItemText primary={text} />
								</ListItem>
							))}
						</List>
					</Drawer>
				</Hidden>
			</div>
		)
	}
}

export const LayoutFrame = withStyles(styles)(LayoutFrameComponent)