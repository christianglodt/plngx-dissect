import { ListItemText, TextField } from "@mui/material";
import { NumPagesCheck } from "../types";
import React, { useState } from "react";
import CheckItemDialog from "../utils/CheckItemDialog";
import CheckItem, { CheckItemDialogPropsType, CheckItemPropsType } from "../utils/CheckItem";


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
            <TextField label="Number of pages" type="number" value={value} onChange={onNumberChanged}></TextField>
        </CheckItemDialog>
    );
}

const NumPagesCheckItem = (props: CheckItemPropsType<NumPagesCheck>) => {

    const pluralize = props.check.num_pages > 1 ? 's' : '';

    return (
        <CheckItem<NumPagesCheck> dialogComponent={NumPagesCheckDialog} {...props}>
            <ListItemText primary="Number of Pages" secondary={`Must have ${props.check.num_pages} page${pluralize}`}></ListItemText>
        </CheckItem>
    );
};

export default NumPagesCheckItem;
