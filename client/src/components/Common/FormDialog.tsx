import * as React from 'react'
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { withStyles } from '@material-ui/core';

interface FormDialogProps {
	fieldNames: string[]
	submit: () => void,
	close: () => void
	fieldUpdate: [(newText: string) => void]
	fieldText: string[]
	message: string
	title: string
	isOpen: boolean
	validationErrors: string[]
}

const formStyle = (theme: any) => ({
	text: {
		fontSize: 12,
		fontFamily: "Syncopate",
		margin: "0 0 0 0",
	},
	errorLabel: {
		paddingTop: 0,
		paddingBottom: 0
	}
})


const getFields = (props) => {
	return props.fieldNames.map((fieldName, index) => (
		<TextField
			autoFocus
			margin="dense"
			id={`${index}`}
			label={fieldName}
			type="text"
			key={`${index}`}
			fullWidth
			value={props.fieldText[index]}
			onChange={(event) => { props.fieldUpdate[index](event.target.value) }}
		/>
	))
}

const getValidationErrors = (props) => {
	if (props.validationErrors.length == 0)
		return ""
	return (
		<h6 color="secondary">
			{props.validationErrors.map(error => (
				<div>{error}<br /></div>
			))}
		</h6>
	)
}

function FormDialogComponent(props: FormDialogProps) {
	return (
		<div>
			<Dialog
				open={props.isOpen}
				onClose={props.close}
				aria-labelledby="form-dialog-title">
				<DialogTitle id="form-dialog-title">{props.title}</DialogTitle>
				<DialogContent>
					<DialogContentText>
						{getValidationErrors(props)}
						{props.message}
					</DialogContentText>
					{getFields(props)}
				</DialogContent>
				<DialogActions>
					<Button onClick={props.close} color="primary">
						Cancel
							</Button>
					<Button onClick={props.submit} color="primary">
						Create
						</Button>
				</DialogActions>
			</Dialog>
		</div>
	);
}

const FormDialog = withStyles(formStyle)(FormDialogComponent)
export default FormDialog
