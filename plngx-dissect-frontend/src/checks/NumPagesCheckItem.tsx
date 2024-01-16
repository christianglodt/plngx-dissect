import { ListItemText, TextField } from "@mui/material";
import { produce } from "immer";
import React, { useState } from "react";
import { NumPagesCheck } from "../types";
import CheckListItem from "../utils/CheckListItem";
import { CheckItemPropsType } from "./types";


const NumPagesCheckItem = (props: CheckItemPropsType<NumPagesCheck>) => {

    const [value, setValue] = useState(props.check.num_pages);

    const onNumberChanged = (event: React.ChangeEvent<HTMLInputElement>) => {
        const n = Number(event.target.value);
        setValue(n > 0 ? n : 1)
    }

    const onChangeConfirmed = () => {
        props.onChange(produce(props.check, draft => {
            draft.num_pages = value;
        }));
    }

    const pluralize = props.check.num_pages > 1 ? 's' : '';

    return (
        <CheckListItem dialogTitle="Check Number of Pages" onChangeConfirmed={onChangeConfirmed} onDelete={props.onDelete}>
            <CheckListItem.DialogContent>
                <TextField label="Number of pages" type="number" value={value} onChange={onNumberChanged}></TextField>
            </CheckListItem.DialogContent>
            <CheckListItem.ItemContent>
                <ListItemText primary="Number of Pages" secondary={`Must have ${props.check.num_pages} page${pluralize}`}></ListItemText>
            </CheckListItem.ItemContent>
        </CheckListItem>
    );
};

export default NumPagesCheckItem;
