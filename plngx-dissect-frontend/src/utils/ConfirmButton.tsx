import Button, { ButtonProps } from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import React, { useState } from 'react';


type ConfirmButtonProps = ButtonProps & {
    dialogTitle: string | React.JSX.Element;
    dialogText: string | React.JSX.Element;
    onConfirmed: () => void;
}

const ConfirmButton = (props: ConfirmButtonProps) => {
    const [open, setOpen] = useState(false);

    const onConfirmed = () => {
        setOpen(false);
        props.onConfirmed();
    }

    return (
        <>
            <Button variant={props.variant} disabled={props.disabled} color={props.color} sx={props.sx} onClick={() => setOpen(true)}>
                {props.children}
            </Button>
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>{props.dialogTitle}</DialogTitle>
                <DialogContent>
                    <DialogContentText>{props.dialogText}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={onConfirmed}>Ok</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default ConfirmButton;
