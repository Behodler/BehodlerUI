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
	validationErrors: string[],
	classes?: any
}

const formStyle = (theme: any) => ({
	title: {
		fontSize: 16,
		fontFamily: "Syncopate",
	},
	message: {
		fontSize: 12,
		fontFamily: "Syncopate",
	},
	errorLabel: {
		paddingTop: 0,
		paddingBottom: 0
	}
})


const getFields = (props:FormDialogProps) => {
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
			InputLabelProps={{
				className:props.classes.message
			}}
			InputProps={{
				className: props.classes.message,
			}}
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
				<DialogTitle id="form-dialog-title"><div className={props.classes.title}>{props.title}</div></DialogTitle>
				<DialogContent>
					<DialogContentText>
						{getValidationErrors(props)}
						<div className={props.classes.message}>{props.message}</div>
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
