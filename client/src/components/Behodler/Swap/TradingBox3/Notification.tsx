import * as React from 'react'
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert, { AlertProps, Color } from '@material-ui/lab/Alert';
import link from "../../../../images/new/externalLink.png"

function Alert(props: AlertProps) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export enum NotificationType {
    rejected,
    pending,
    success,
    fail
}

interface props {
    type: NotificationType,
    hash: string
    open: boolean
    setOpen: (o: boolean) => void
}

export function Notification(props: props) {

    const handleClose = (event?: React.SyntheticEvent, reason?: string) => {
        if(reason === 'clickaway') return;
        props.setOpen(false);
    };
    let severity: Color = "info"
    let message: string = "Transaction submitted"

    switch (props.type) {
        case NotificationType.pending:
            break;
        case NotificationType.success:
            message = "Transaction Success"
            severity = "success"
            break;
        case NotificationType.fail:
            message = "Transaction Failed"
            severity = "error"
            break;
        case NotificationType.rejected:
            message = "User rejected transaction"
            severity = "warning"
            break;
    }

    return (
        <Snackbar open={props.open} autoHideDuration={15000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }} >
            <Alert onClose={handleClose} severity={severity} action={
                props.type === NotificationType.rejected ? <div></div> :
                    <a href={`https://etherscan.io/tx/${props.hash}`} target="_blank" rel="noopener noreferrer">
                        <img src={link} alt="link" style={{ width: "20px", height: "20px" }} />
                    </a>
            }>
                {message}
            </Alert>
        </Snackbar>
    );
}