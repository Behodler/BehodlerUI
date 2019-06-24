import * as React from 'react'
import { TextField, ListItem, List, Link, withStyles } from '@material-ui/core';

interface props {
	text: string
	placeholder: string
	changeText: (text: string) => void
	entireAction?: () => void,
	classes?: any
}

const style = (theme: any) => ({
	link: {
		marginTop: '-20px'
	}
})

export function ValueTextBoxComponent(props: props) {
	return (
		<div>
			<List>
				<ListItem>
					<TextField
						label={props.placeholder}
						type="text"
						name={props.placeholder}
						autoComplete={props.placeholder}
						margin="normal"
						variant="outlined"
						value={props.text}
						onChange={(event) => { props.changeText(event.target.value) }}
					/>
				</ListItem>
				<ListItem>
					<Link className={props.classes.link}
						variant="body2"
						href='#'
						onClick={(e: any) => { e.preventDefault(); if (props.entireAction) props.entireAction(); }}>
						entire balance
    		</Link>
				</ListItem>
			</List>
		</div>)
}

export const ValueTextBox = withStyles(style)(ValueTextBoxComponent)