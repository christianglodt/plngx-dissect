import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import React from "react";
import ConfirmButton from "./ConfirmButton";

type CheckItemDialogPropsType = {
    title: string | React.JSX.Element;
    open: boolean;
    onConfirmed: () => void;
    onClose: () => void;
    onDelete: () => void;
    children?: string | React.JSX.Element[];
}

const CheckItemDialog = (props: CheckItemDialogPropsType) => {
    const { title, open, onConfirmed, onClose, onDelete } = props;

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                {props.children}
            </DialogContent>
            <DialogActions>
                <ConfirmButton variant="text" color="warning" sx={{ marginRight: 'auto' }} dialogTitle="Delete Check?" dialogText="Are you sure to delete this check?" onConfirmed={onDelete}>Delete</ConfirmButton>
                <Button variant="outlined" onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={onConfirmed}>Ok</Button>
            </DialogActions>
        </Dialog>
    );   
}

export default CheckItemDialog;
