import * as React from 'react'
import InputAdornment from '@material-ui/core/InputAdornment';
import Input from '@material-ui/core/Input';
import FormControl from '@material-ui/core/FormControl';
import { InputLabel, Button } from '@material-ui/core';


interface props{
	buttonEvent:()=>void
	changeText:(text:string)=>void
	text:string
	label:string
}

function ButtonAdornedTextBox(props:props){
	const inputID = props.label+'-input'
	return <FormControl>
		<InputLabel htmlFor={inputID}>{props.label}</InputLabel>
		<Input id ={inputID} type="text" onChange={(event)=>props.changeText(event.target.value)} value={props.text}
		endAdornment={
			<InputAdornment position="start">
				<Button variant="contained" color="primary" onClick={props.buttonEvent}>New</Button>
			</InputAdornment>
		}/>
	</FormControl>
}

export default ButtonAdornedTextBox