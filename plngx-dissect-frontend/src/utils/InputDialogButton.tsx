import { ButtonProps } from '@mui/material/Button';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import React, { useState, KeyboardEvent } from 'react';

type InputDialogPropsType = ButtonProps & {
    dialogTitle: string;
    dialogText: string;
    label: string;
    icon?: React.ReactElement;
    value?: string;
    onConfirmed: (value: string) => void;
    error?: string;
    onTextChanged?: (value: string) => void;
}

const InputDialogButton = (props: InputDialogPropsType) => {

    const [dialogOpen, setDialogOpen] = useState(false);
    const [value, setValue] = useState(props.value);

    const onDialogClosed = () => {
        setDialogOpen(false);
        setValue(props.value);
    }

    const onConfirmed = () => {
        if (value) {
            props.onConfirmed(value);
            onDialogClosed();    
        }
    }

    const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        const value = (event.target as HTMLInputElement).value;
        if (event.key === 'Enter') {
            onConfirmed();
            setValue(value);
            event.preventDefault();
        }
    }

    const onKeyUp = (event: KeyboardEvent<HTMLInputElement>) => {
        const value = (event.target as HTMLInputElement).value;
        if (props.onTextChanged) {
            props.onTextChanged(value);
        }
    }    

    let errorMessage;
    if (props.error) {
        errorMessage = props.error;
    } else {
        errorMessage = (value || '').trim() === '' ? 'Can not be empty' : null;
    }

    return (
        <>
            <Dialog open={dialogOpen} onClose={onDialogClosed}>
                <DialogTitle>{props.dialogTitle}</DialogTitle>
                <DialogContent>
                    <TextField sx={{ marginTop: '0.5rem', marginBottom: '0.5rem' }} autoFocus required label="New Pattern Name" fullWidth defaultValue={value || ''} onChange={(event) => setValue(event.target.value)} onKeyDown={onKeyDown} onKeyUp={onKeyUp} error={errorMessage !== null} helperText={errorMessage}/>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onDialogClosed}>Cancel</Button>
                    <Button onClick={onConfirmed}>{props.label}</Button>
                </DialogActions>
            </Dialog>
            <Button onClick={() => setDialogOpen(true)} color={props.color} sx={props.sx} startIcon={props.icon}>{props.label}</Button>
        </>
    );
};

export default InputDialogButton;
