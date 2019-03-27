import * as React from 'react'


interface LayoutFrameProps{

}

/*
outergrid:
	direction row
	spacing is minimal
	justify=space-between
	alignitems = stretch

outer grids:
	direction column
	justify = space-around
	alignitems = either center or stretch
*/

export class LayoutFrame extends React.Component<LayoutFrameProps,any>{

	render(){
		return <div>hello there</div>
	}
}