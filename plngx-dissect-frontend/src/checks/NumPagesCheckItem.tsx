import { Input, ListItemText } from "@mui/material";
import { NumPagesCheck } from "../types";
import React, { useState } from "react";
import CheckItemDialog from "../utils/CheckItemDialog";
import CheckItem, { CheckItemDialogPropsType } from "../utils/CheckItem";


const NumPagesCheckDialog = (props: CheckItemDialogPropsType<NumPagesCheck>) => {

    const [value, setValue] = useState(props.check.num_pages);

    const onNumberChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        const n = Number(event.target.value);
        setValue(n > 0 ? n : 1)
    }

    const onChangeDraft = (draft: NumPagesCheck) => {
        draft.num_pages = value;
    }

    return (
        <CheckItemDialog<NumPagesCheck> title="Check Number of Pages" onChangeDraft={onChangeDraft} {...props}>
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

    const pluralize = check.num_pages > 1 ? 's' : '';

    return (
        <CheckItem<NumPagesCheck> dialogComponent={NumPagesCheckDialog} check={check} onChange={onChange} onDelete={onDelete}>
            <ListItemText primary="Number of Pages" secondary={`Must have ${check.num_pages} page${pluralize}`}></ListItemText>
        </CheckItem>
    );
};

export default NumPagesCheckItem;
