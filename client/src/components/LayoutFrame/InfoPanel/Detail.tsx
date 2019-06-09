import * as React from 'react'
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

const style = {
	card: {
		minWidth: 275,
	},
	bullet: {
		display: 'inline-block',
		margin: '0 2px',
		transform: 'scale(0.8)',
	},
	title: {
		fontSize: 14,
	},
	pos: {
		marginBottom: 12,
	},
};

export interface DetailProps {
	visible: boolean
	header: string,
	content: string,
	linkText?: string
	linkURL?: string
	classes?: any
}

let getButton = (linkText, linkURL) => {
	if (linkText && linkURL) {
		return (
			<Button size="small" onClick={() => { window.open(linkURL, '_blank') }}>{linkText}</Button>
		)
	}
	return ""
}

export function detail(props: DetailProps) {
	const classes = props.classes

	return (
		<Card className={classes.card}>
			<CardContent>
				<Typography className={classes.title} color="textSecondary" gutterBottom>
					{props.header}
				</Typography>
				<Typography variant="body2" component="p">
					{props.content}
				</Typography>
			</CardContent>
			<CardActions>
				{getButton(props.linkText, props.linkURL)}
			</CardActions>
		</Card>

	);
}

export const Detail =  withStyles(style)(detail)