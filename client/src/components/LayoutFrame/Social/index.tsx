import * as React from 'react'

import github from '../../../customIcons/github.svg'
import medium from '../../../customIcons/medium.svg'
import discord from '../../../customIcons/discord.png'
import { IconButton, Icon, withStyles } from '@material-ui/core';

const style = (theme: any) => ({
	Button: {
		margin: "10px 20px 10px 10px",
		padding: "0"
	},
	discord:{
		padding: "0",
		width:"25px",
		margin: "0 auto"
	}
})

interface SocialProps {
	classes?: any
}

function SocialComponent(props:SocialProps){
		const { classes } = props
		return (
			<div>
				<IconButton className={classes.Button}>
					<Icon><img src={github} onClick={()=>window.open('https://github.com/gititGoro/weidai')} /></Icon>
				</IconButton>
				<IconButton className={classes.Button} onClick={()=>window.open('https://medium.com/weidaithriftcoin')}>
					<Icon><img src={medium} /></Icon>
				</IconButton>
				<IconButton  onClick={()=>window.open('https://discord.gg/s6bKYjj')}>
					<Icon><img className={classes.discord} src={discord} /></Icon>
				</IconButton>
			</div>
		)
}

export const Social = withStyles(style)(SocialComponent)