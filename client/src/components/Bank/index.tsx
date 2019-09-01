import * as React from 'react'
import { withStyles } from '@material-ui/core';


interface bankProps {
	classes?: any
}

const style = (theme: any) => {

}

function BankComponent(props: bankProps) {
	return <h1>Bank Component</h1>
}

export default withStyles(style)(BankComponent)