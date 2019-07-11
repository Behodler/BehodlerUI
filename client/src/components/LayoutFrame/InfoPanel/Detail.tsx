import * as React from 'react'
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import lightBlue from '@material-ui/core/colors/lightBlue'

const style = (theme: any) => (
	{
		card: {
			backgroundColor: lightBlue['50'],

		},
		typography: {
			margin:"0 0 10px 0"
		},

		pos: {
			marginBottom: 12,
		}
	}
);

export interface DetailProps {
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
				<Typography variant="h6" className={classes.typography}>
					{props.header}
				</Typography>
				<Typography variant="subtitle2" className={classes.typography}>
					{props.content}
				</Typography>
			</CardContent>
			<CardActions>
				{getButton(props.linkText, props.linkURL)}
			</CardActions>
		</Card>

	);
}

export const Detail = withStyles(style)(detail)