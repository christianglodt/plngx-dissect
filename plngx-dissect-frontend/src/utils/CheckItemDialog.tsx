import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import React from "react";
import ConfirmButton from "./ConfirmButton";
import { Draft, produce } from "immer";

type CheckItemDialogPropsType<CheckType> = {
    title: string | React.JSX.Element;
    check: CheckType;
    open: boolean;
    onChange: (newCheck: CheckType) => void;
    onChangeDraft: (draft: Draft<CheckType>) => void;
    onClose: () => void;
    onDelete: () => void;
    children?: React.ReactNode[] | React.ReactNode;
}

const CheckItemDialog = <CheckType,>(props: CheckItemDialogPropsType<CheckType>) => {
    const { title, check, open, onChange, onChangeDraft, onClose, onDelete } = props;

    const onConfirmed = () => {
        const newCheck = produce(check, draft => {
            onChangeDraft(draft);
        });
        onChange(newCheck);
        onClose();
    }

    const onDeleteConfirmed = () => {
        onDelete();
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                {props.children}
            </DialogContent>
            <DialogActions>
                <ConfirmButton variant="text" color="warning" sx={{ marginRight: 'auto' }} dialogTitle="Delete Check?" dialogText="Are you sure to delete this check?" onConfirmed={onDeleteConfirmed}>Delete</ConfirmButton>
                <Button variant="outlined" onClick={onClose}>Cancel</Button>
                <Button variant="contained" onClick={onConfirmed}>Ok</Button>
            </DialogActions>
        </Dialog>
    );   
}

export default CheckItemDialog;
