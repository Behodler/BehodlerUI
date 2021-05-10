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
		color: '#ddd',
		fontSize: 24,
		margin: "0 0 20px 0"
	},
	subheading: {
		color: '#dddddd',
		fontSize: 14,
		margin: "20px 0 0"
	},
	image:{
		maxWidth:'100px'
	}
}
let styles = (theme: any) => styleObject

interface props {
	classes?: any
	headingMessage?: string|boolean
	subheadingMessage?: string|boolean
}

function LoadingComponent(props: props) {
	const {
		classes,
		headingMessage,
		subheadingMessage,
	} = props;

	return (
		<div className={classes.root}>
			<div className={classes.content}>
				<main
					style={{
						backgroundColor: 'rgba(0,0,0,0.9)',
						display: 'flex',
						height: '100%',
						justifyContent: 'center',
						left: 0,
						padding: '32px',
						position: 'absolute',
						top: 0,
						width: '100%',
						zIndex: 999,
					}}
				>
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
									<h3 className={classes.heading}>
										{headingMessage && (
											<span>
												{headingMessage}
											</span>
										)}

										{!headingMessage && headingMessage !== false && (
											<span>
												Loading blockchain data, please wait...
											</span>
										)}
									</h3>
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
											<img src={loading} className={classes.image} />
										</Grid>
										<Grid item>
										&nbsp;
										</Grid>
									</Grid>
								</Grid>
							</Grid>
						</Grid>
						<Grid item>
							<h5 className={classes.subheading}>
								{subheadingMessage && (
									<span>
										{subheadingMessage}
									</span>
								)}

								{!subheadingMessage && subheadingMessage !== false && (
									<span>
										If this takes too long, consider refreshing your browser and/or reconnecting your wallet provider
									</span>
								)}
							</h5>
						</Grid>
					</Grid>
				</main>
			</div>
		</div>);
}

export const Loading = withStyles(styles)(LoadingComponent)
