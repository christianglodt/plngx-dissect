import { ListItemText, TextField } from "@mui/material";
import { produce } from "immer";
import { useState } from "react";
import { StoragePathCheck } from "../types";
import CheckListItem from "../utils/CheckListItem";
import { CheckItemPropsType } from "./types";

const StoragePathCheckItem = (props: CheckItemPropsType<StoragePathCheck>) => {
    const [value, setValue] = useState(props.check.name);

    const onChangeConfirmed = () => {
        props.onChange(produce(props.check, draft => {
            draft.name = value;
        }));
    }

    return (
        <CheckListItem dialogTitle="Check Storage Path" onChangeConfirmed={onChangeConfirmed} onDelete={props.onDelete}>
            <CheckListItem.DialogContent>
                <TextField label="Storage Path" value={value} onChange={(event) => setValue(event.target.value)}></TextField>
            </CheckListItem.DialogContent>
            <CheckListItem.ItemContent>
                <ListItemText primary="Storage Path" secondary={`Must be "${props.check.name}"`}></ListItemText>
            </CheckListItem.ItemContent>
        </CheckListItem>
    );
};

export default StoragePathCheckItem;
