import Button, { ButtonProps } from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import React, { useState } from 'react';


type ConfirmButtonProps = ButtonProps & {
    icon?: React.ReactElement;
    dialogTitle: string | React.JSX.Element;
    dialogText: string | React.JSX.Element;
    onConfirmed: () => void;
}

const ConfirmButton = ({icon, dialogTitle, dialogText, onConfirmed, ...buttonProps}: ConfirmButtonProps) => {
    const [open, setOpen] = useState(false);

    const onDialogConfirmed = () => {
        setOpen(false);
        onConfirmed();
    }

    return (
        <>
            <Button onClick={() => setOpen(true)} startIcon={icon} {...buttonProps}></Button>
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>{dialogTitle}</DialogTitle>
                <DialogContent>
                    <DialogContentText>{dialogText}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={onDialogConfirmed}>Ok</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default ConfirmButton;
