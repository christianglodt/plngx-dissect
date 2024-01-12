import { Input, ListItem, ListItemText } from "@mui/material";
import { NumPagesCheck } from "../types";
import React, { useState } from "react";
import { produce } from "immer";
import CheckItemDialog from "../utils/CheckItemDialog";

type NumPagesCheckDialogPropsType = {
    check: NumPagesCheck;
    open: boolean;
    onClose: () => void;
    onChange: (newCheck: NumPagesCheck) => void;
    onDelete: () => void;
}

const NumPagesCheckDialog = (props: NumPagesCheckDialogPropsType) => {
    const { check, open, onClose, onChange, onDelete } = props;

    const [value, setValue] = useState(check.num_pages);

    const onNumberChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        const n = Number(event.target.value);
        setValue(n > 0 ? n : 1)
    }

    const onConfirmed = () => {
        const newCheck = produce(check, draft => {
            draft.num_pages = value;
        });
        onChange(newCheck);
        onClose();
    }

    return (
        <CheckItemDialog title="Check Number of Pages" open={open} onClose={onClose} onConfirmed={onConfirmed} onDelete={onDelete}>
            <div>Number of pages must be:</div>
            <Input type="number" value={value} onChange={onNumberChanged}></Input>
        </CheckItemDialog>
    );
}

type NumPagesCheckPropsType = {
    check: NumPagesCheck;
    onChange: (newCheck: NumPagesCheck) => void;
    onDelete: () => void;
}

const NumPagesCheckItem = (props: NumPagesCheckPropsType) => {

    const { check, onChange, onDelete } = props;

    const [dialogOpen, setDialogOpen] = useState(false);
    const pluralize = check.num_pages > 1 ? 's' : '';

    return (
        <>
            <NumPagesCheckDialog check={check} open={dialogOpen} onClose={() => setDialogOpen(false)} onChange={onChange} onDelete={onDelete}/>
            <ListItem onClick={() => setDialogOpen(true)} sx={{ cursor: 'pointer' }}>
                <ListItemText primary="Nr. of Pages" secondary={`Must have ${check.num_pages} page${pluralize}`}></ListItemText>
            </ListItem>
        </>
    );
};

export default NumPagesCheckItem;
