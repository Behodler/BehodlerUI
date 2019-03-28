import * as React from 'react'

import github from '../../../customIcons/github.svg'
import medium from '../../../customIcons/medium.svg'
import { IconButton, Icon, withStyles } from '@material-ui/core';

const style = (theme: any) => ({
	Button: {
		margin: "10px 20px 0 0",
		padding: "0"
	}
})

interface SocialProps {
	classes?: any
}

class SocialComponent extends React.Component<SocialProps, any> {
	render() {
		const { classes } = this.props
		return (
			<div>
				<IconButton className={classes.Button}>
					<Icon><img src={github} /></Icon>
				</IconButton>
				<IconButton className={classes.Button}>
					<Icon><img src={medium} /></Icon>
				</IconButton>
			</div>
		)
	}
}

export const Social = withStyles(style)(SocialComponent)