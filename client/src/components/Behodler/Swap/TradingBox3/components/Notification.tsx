import * as React from 'react'
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert, { AlertProps, Color } from '@material-ui/lab/Alert';
import { atom, useAtom } from 'jotai';

import link from "../../../../../images/new/externalLink.png"

export enum NotificationType {
    rejected,
    pending,
    success,
    fail,
    newBlock
}

interface Notification {
    type: NotificationType,
    txHash: string
    open: boolean
}

const initialNotification: Notification = {
    open: false,
    type: NotificationType.pending,
    txHash: '',
}

const notificationAtom = atom(initialNotification)

export const useShowNotification = () => {
    const [, setNotification] = useAtom(notificationAtom)

    return (type: NotificationType, txHash: string, callback?: Function) => {
        setNotification({ type, open: true, txHash })
        return callback?.()
    }
}

export function Notification() {
    const [notification, setNotification] = useAtom(notificationAtom)

    const handleClose = (event?: React.SyntheticEvent, reason?: string) => {
        setTimeout(() => {
            setNotification({ ...notification, open: false, txHash: '' });
        }, 3000)
    };

    let severity: Color = "info"
    let message: string = "Transaction submitted"

    switch (notification.type) {
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
        case NotificationType.newBlock:
            message = "New Block mined"
            severity = "info"
    }

    return (
        <Snackbar
            open={notification.open}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            autoHideDuration={3000}
        >
            <Alert onClose={handleClose} severity={severity} action={
                notification.type === NotificationType.rejected ? <div></div> :
                    <a href={`https://etherscan.io/tx/${notification.txHash}`} target="_blank" rel="noopener noreferrer">
                        <img src={link} alt="link" style={{ width: "20px", height: "20px" }} />
                    </a>
            }>
                {message}
            </Alert>
        </Snackbar>
    );
}

function Alert(props: AlertProps) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}
