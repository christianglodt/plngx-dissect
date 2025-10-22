import { ButtonProps } from '@mui/material/Button';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material';
import React, { useState, KeyboardEvent } from 'react';

type InputDialogPropsType = ButtonProps & {
    dialogTitle: string;
    dialogText?: string;
    label: string;
    icon?: React.ReactElement;
    value?: string;
    onConfirmed: (value: string) => void;
    error?: string;
    onTextChanged?: (value: string) => void;
}

const InputDialogButton = ({dialogTitle, dialogText, label, icon, value, onConfirmed, error, onTextChanged, ...buttonProps}: InputDialogPropsType) => {

    const [dialogOpen, setDialogOpen] = useState(false);
    const [currentValue, setCurrentValue] = useState(value);

    const onDialogClosed = () => {
        setDialogOpen(false);
        setCurrentValue(value);
    }

    const onDialogConfirmed = () => {
        if (currentValue) {
            onConfirmed(currentValue);
            onDialogClosed();    
        }
    }

    const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        const value = (event.target as HTMLInputElement).value;
        if (event.key === 'Enter') {
            setCurrentValue(value);
            onConfirmed(value);
            event.preventDefault();
        }
    }

    const onKeyUp = (event: KeyboardEvent<HTMLInputElement>) => {
        const value = (event.target as HTMLInputElement).value;
        if (onTextChanged) {
            onTextChanged(value);
        }
    }    

    let errorMessage;
    if (error) {
        errorMessage = error;
    } else {
        errorMessage = (value || '').trim() === '' ? 'Can not be empty' : null;
    }

    return (
        <>
            <Dialog open={dialogOpen} onClose={onDialogClosed}>
                <DialogTitle>{dialogTitle}</DialogTitle>
                <DialogContent>
                    { dialogText &&
                    <DialogContentText>{dialogText}</DialogContentText>
                    }
                    <TextField sx={{ marginTop: '0.5rem', marginBottom: '0.5rem', width: '500px' }} autoFocus required label="New Pattern Name" fullWidth defaultValue={value || ''} onChange={(event) => setCurrentValue(event.target.value)} onKeyDown={onKeyDown} onKeyUp={onKeyUp} error={errorMessage !== null} helperText={errorMessage}/>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onDialogClosed}>Cancel</Button>
                    <Button onClick={onDialogConfirmed}>{label}</Button>
                </DialogActions>
            </Dialog>
            <Button onClick={() => setDialogOpen(true)} startIcon={icon} {...buttonProps}>{label}</Button>
        </>
    );
};

export default InputDialogButton;
