import { ListItemText, TextField } from "@mui/material";
import { produce } from "immer";
import React, { useState } from "react";
import { NumPagesCheck } from "../types";
import DialogListItem from "../utils/DialogListItem";
import { CheckItemPropsType } from "./types";
import CheckResultIcon from "../utils/CheckResultIcon";


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
        <DialogListItem dialogTitle="Check Number of Pages" onChangeConfirmed={onChangeConfirmed} onDelete={props.onDelete}>
            <DialogListItem.DialogContent>
                <TextField label="Number of pages" type="number" value={value} onChange={onNumberChanged} sx={{ width: '100%' }}></TextField>
            </DialogListItem.DialogContent>
            <DialogListItem.ItemContent icon={<CheckResultIcon result={props.result}/>}>
                <ListItemText primary="Number of Pages" secondary={`Must have ${props.check.num_pages} page${pluralize}`}></ListItemText>
            </DialogListItem.ItemContent>
        </DialogListItem>
    );
};

export default NumPagesCheckItem;
