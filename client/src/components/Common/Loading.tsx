import * as React from 'react'
import loading from '../../images/ethereumloading.gif';
import { withStyles, Grid } from '@material-ui/core';
const styleObject = {
	loadingRoot: {
		display: "flex"
	},
	content: {
		flexGrow: 1,
	},
	heading: {
		fontSize: 30,
		margin: "10px 0 5px 0"
	},
	subheading: {
		fontSize: 16,
		margin: "0px 0 5px 0"
	},
	image:{
		maxWidth:'100px'
	}
}
let styles = (theme: any) => styleObject

interface props {
	classes?: any
}

function LoadingComponent(props: props) {

	return (
		<div className={props.classes.root}>
			<div className={props.classes.content}>
				<main>
					<Grid
						container
						direction="column"
						justify="center"
						alignItems="center"
						spacing={2}
					>
						<Grid item>
							<Grid container
								direction="column"
								alignItems="center"
								spacing={1}
							>
								<Grid item>
									<h3>Loading from the Ethereum blockchain...</h3>
								</Grid>
							</Grid>
						</Grid>
						<Grid item>
							<Grid
								container
								direction="row"
								justify="center"
								alignItems="center"
								alignContent="center">
								<Grid item>
									<Grid container
										direction="column"
										justify="flex-start"
										alignItems="center"
										spacing={3}
									>
										<Grid item>
										&nbsp;
										</Grid>
										<Grid item>
											<img src={loading} className={props.classes.image} />
										</Grid>
										<Grid item>
										&nbsp;
										</Grid>
									</Grid>
								</Grid>
							</Grid>
						</Grid>
						<Grid item>
						<h5>If this takes too long, consider resetting the MetaMask extension or restarting your browser </h5>
						</Grid>
					</Grid>
				</main>
			</div>
		</div>);
}

export const Loading = withStyles(styles)(LoadingComponent)