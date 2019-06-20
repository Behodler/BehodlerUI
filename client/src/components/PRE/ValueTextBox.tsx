import * as React from 'react'
import { TextField, ListItem, List, Link } from '@material-ui/core';

interface props {
	text: string
	placeholder: string
	changeText: (text: string) => void
	entireAction?: () => void
}

export function ValueTextBox(props: props) {
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
					<Link
						variant="body2"
						onClick={props.entireAction}>
						use entire balance
    		</Link>
				</ListItem>
			</List>
		</div>)
}