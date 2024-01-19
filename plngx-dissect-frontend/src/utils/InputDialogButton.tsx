import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { useState } from 'react';


type InputDialogPropsType = {
    dialogTitle: string;
    dialogText: string;
    label: string;
    onConfirmed: (value: string) => void;
    // TODO optional validation function
}

const InputDialogButton = (props: InputDialogPropsType) => {

    const [dialogOpen, setDialogOpen] = useState(false);
    const [value, setValue] = useState('');

    const onDialogClosed = () => {
        setDialogOpen(false);
        setValue('');
    }

    const onConfirmed = () => {
        props.onConfirmed(value);
        onDialogClosed();
    }

    const errorMessage = value.trim() === '' ? 'Can not be empty' : null;

    return (
        <>
            <Dialog open={dialogOpen} onClose={onDialogClosed}>
                <DialogTitle>{props.dialogTitle}</DialogTitle>
                <DialogContent>
                    <TextField sx={{ marginTop: '0.5rem' }} autoFocus required label="New Pattern Name" fullWidth value={value} onChange={(event) => setValue(event.target.value)} error={errorMessage !== null} helperText={errorMessage}/>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onDialogClosed}>Cancel</Button>
                    <Button onClick={onConfirmed}>{props.label}</Button>
                </DialogActions>
            </Dialog>
            <Button onClick={() => setDialogOpen(true)}>{props.label}</Button>
        </>
    );
};

export default InputDialogButton;
