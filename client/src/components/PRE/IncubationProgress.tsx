import * as React from 'react'
import { withStyles } from '@material-ui/styles';
import LinearProgress from '@material-ui/core/LinearProgress';
import { lighten } from '@material-ui/core/styles';
import { Box } from '@material-ui/core';

interface props{
	progress:number,
	classes?:any
}

const styles = (theme:any) =>({
	root: {
		height: 20,
		backgroundColor: lighten('#ff6c5c', 0.5),
	  },
	  bar: {
		borderRadius: 20,
		backgroundColor: '#ff6c5c',
	},
	BoxContainer:{
		width:"400px",
		margin:"30px 0 30px 0",
	}
})

function IncubationProgressComponent(props:props){
	return(
		<Box component="div" className={props.classes.BoxContainer}>
			<LinearProgress value={props.progress} variant="determinate" color="secondary"/>
		</Box>
	)
}

export const IncubationProgress = withStyles(styles)(IncubationProgressComponent)