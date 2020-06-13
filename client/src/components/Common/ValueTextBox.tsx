import * as React from 'react'
import { TextField, ListItem, List, Link, withStyles } from '@material-ui/core';

interface props {
	text: string
	placeholder: string
	changeText: (text: string) => void
	entireAction?: () => void,
	small?: boolean
	classes?: any
}

const style = (theme: any) => ({
	link: {
		marginTop: '-20px',
		color: 'LightSlateGray'
	},
	field: {
	}
})

export function ValueTextBoxComponent(props: props) {
	return (
		<div>
			<List>
				<ListItem>
					<TextField
						size={props.small ? "small" : undefined}
						label={props.placeholder}
						type="text"
						name={props.placeholder}
						autoComplete={props.placeholder}
						margin="normal"
						variant="outlined"
						value={props.text}
						onChange={(event) => { props.changeText(event.target.value) }}
						className={props.classes.field}
					/>
				</ListItem>
				{!!props.entireAction ?
					<ListItem>
						<Link className={props.classes.link}

							href='#'
							onClick={(e: any) => { e.preventDefault(); if (props.entireAction) props.entireAction(); }}>
							entire balance
    			</Link>
					</ListItem> : ""
				}
			</List>
		</div>)
}

export const ValueTextBox = withStyles(style)(ValueTextBoxComponent)