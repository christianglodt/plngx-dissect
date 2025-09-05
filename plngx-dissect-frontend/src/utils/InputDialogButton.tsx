import { ButtonProps } from '@mui/material/Button';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { useState, KeyboardEvent } from 'react';


type InputDialogPropsType = ButtonProps & {
    dialogTitle: string;
    dialogText: string;
    label: string;
    value?: string;
    onConfirmed: (value: string) => void;
    // TODO optional validation function
}

const InputDialogButton = (props: InputDialogPropsType) => {

    const [dialogOpen, setDialogOpen] = useState(false);
    const [value, setValue] = useState(props.value);

    const onDialogClosed = () => {
        setDialogOpen(false);
        setValue('');
    }

    const onConfirmed = () => {
        if (value) {
            props.onConfirmed(value);
            onDialogClosed();    
        }
    }

    const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            onConfirmed();
            setValue((event.target as HTMLInputElement).value);
            event.preventDefault();
        }
    }

    const errorMessage = (value || '').trim() === '' ? 'Can not be empty' : null;

    return (
        <>
            <Dialog open={dialogOpen} onClose={onDialogClosed}>
                <DialogTitle>{props.dialogTitle}</DialogTitle>
                <DialogContent>
                    <TextField sx={{ marginTop: '0.5rem' }} autoFocus required label="New Pattern Name" fullWidth defaultValue={value || ''} onChange={(event) => setValue(event.target.value)} onKeyDown={onKeyDown} error={errorMessage !== null} helperText={errorMessage}/>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onDialogClosed}>Cancel</Button>
                    <Button onClick={onConfirmed}>{props.label}</Button>
                </DialogActions>
            </Dialog>
            <Button onClick={() => setDialogOpen(true)} color={props.color} sx={props.sx}>{props.label}</Button>
        </>
    );
};

export default InputDialogButton;
