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

class FormDialogComponent extends React.Component<FormDialogProps, any> {
	constructor(props: FormDialogProps) {
		super(props)
		this.getFields = this.getFields.bind(this)
		this.getValidationErrors = this.getValidationErrors.bind(this)
	}


	getFields() {
		return this.props.fieldNames.map((fieldName, index) => (
			<TextField
				autoFocus
				margin="dense"
				id={`${index}`}
				label={fieldName}
				type="text"
				key={`${index}`}
				fullWidth
				value={this.props.fieldText[index]}
				onChange={(event) => { this.props.fieldUpdate[index](event.target.value) }}
			/>
		))
	}

	getValidationErrors() {
		if (this.props.validationErrors.length == 0)
			return ""
		return (
			<h6 color="secondary">
				{this.props.validationErrors.map(error => (
					<div>{error}<br /></div>
				))}
			</h6>
		)
	}

	render() {
		return (
			<div>
				<Dialog
					open={this.props.isOpen}
					onClose={this.props.close}
					aria-labelledby="form-dialog-title">
					<DialogTitle id="form-dialog-title">{this.props.title}</DialogTitle>
					<DialogContent>
						<DialogContentText>
							{this.getValidationErrors()}
							{this.props.message}
						</DialogContentText>
						{this.getFields()}
					</DialogContent>
					<DialogActions>
						<Button onClick={this.props.close} color="primary">
							Cancel
							</Button>
						<Button onClick={this.props.submit} color="primary">
							Create
						</Button>
					</DialogActions>
				</Dialog>
			</div>
		);
	}
}

const FormDialog = withStyles(formStyle)(FormDialogComponent)
export default FormDialog
