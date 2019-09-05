import * as React from 'react'
import loading from '../../images/blockchainloading.gif';
import { withStyles, Grid } from '@material-ui/core';
const styleObject = {
	root: {
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
						spacing={10}
					>
						<Grid item><h4>Loading from blockchain...</h4></Grid>
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
									>
										<Grid item>
											<img src={loading} />
										</Grid>
									</Grid>
								</Grid>
							</Grid>
						</Grid>
						<Grid item>

						</Grid>
					</Grid>
				</main>
			</div>
		</div>);
}

export const Loading = withStyles(styles)(LoadingComponent)