import * as React from 'react'
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';

import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add'
import AssignmentReturned from '@material-ui/icons/AssignmentReturned'
import Timeline from '@material-ui/icons/Timeline'
import Computer from '@material-ui/icons/Computer'
import QuestionAnswer from '@material-ui/icons/QuestionAnswer'
import { Hidden } from '@material-ui/core';

const styles = {
	root: {
		flexGrow: 1,
	},
	grow: {
		flexGrow: 1,
	},
	menuButton: {
		marginLeft: -12,
		marginRight: 20,
		fontSize:12
	},
};

interface MobileProps {
	classes?: any
}

class Mobile extends React.Component<MobileProps, any>{
	render() {
		const { classes } = this.props;
		return (
			<Hidden lgUp>
				<div className={classes.root}>
					<AppBar position="static">
						<Toolbar>
							<IconButton className={classes.menuButton} color="inherit" aria-label="Menu">
								<AddIcon />&nbsp; Create
							</IconButton>
							<IconButton className={classes.menuButton} color="inherit" aria-label="Menu">
								<AssignmentReturned />&nbsp; Redeem
							</IconButton>
							<IconButton className={classes.menuButton} color="inherit" aria-label="Menu">
								<Timeline />&nbsp; History
							</IconButton>
							<IconButton className={classes.menuButton} color="inherit" aria-label="Menu">
								<Computer />&nbsp; Learn
							</IconButton>
							<IconButton className={classes.menuButton} color="inherit" aria-label="Menu">
								<QuestionAnswer />&nbsp; Thriftcoin??
							</IconButton>
						</Toolbar>
					</AppBar>
				</div>
			</Hidden>
		);
	}
}


export default withStyles(styles)(Mobile);