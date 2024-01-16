import { ListItemText, TextField } from "@mui/material";
import { produce } from "immer";
import { useState } from "react";
import { CorrespondentCheck } from "../types";
import CheckListItem from "../utils/CheckListItem";
import { CheckItemPropsType } from "./types";


const CorrespondentCheckItem = (props: CheckItemPropsType<CorrespondentCheck>) => {
    const [value, setValue] = useState(props.check.name);

    const onChangeConfirmed = () => {
        props.onChange(produce(props.check, draft => {
            draft.name = value;
        }));
    }

    return (
        <CheckListItem dialogTitle="Check Correspondent" onChangeConfirmed={onChangeConfirmed} onDelete={props.onDelete}>
            <CheckListItem.DialogContent>
                <TextField label="Correspondent" value={value} onChange={(event) => setValue(event.target.value)}></TextField>
            </CheckListItem.DialogContent>
            <CheckListItem.ItemContent>
                <ListItemText primary="Correspondent" secondary={`Must be "${props.check.name}"`}></ListItemText>
            </CheckListItem.ItemContent>
        </CheckListItem>
    );
};

export default CorrespondentCheckItem;
