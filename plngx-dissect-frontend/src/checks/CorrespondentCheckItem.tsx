import { ListItemText, TextField } from "@mui/material";
import { produce } from "immer";
import { useState } from "react";
import { CorrespondentCheck } from "../types";
import DialogListItem from "../utils/DialogListItem";
import { CheckItemPropsType } from "./types";


const CorrespondentCheckItem = (props: CheckItemPropsType<CorrespondentCheck>) => {
    const [value, setValue] = useState(props.check.name);

    const onChangeConfirmed = () => {
        props.onChange(produce(props.check, draft => {
            draft.name = value;
        }));
    }

    return (
        <DialogListItem dialogTitle="Check Correspondent" onChangeConfirmed={onChangeConfirmed} onDelete={props.onDelete}>
            <DialogListItem.DialogContent>
                <TextField label="Correspondent" value={value} onChange={(event) => setValue(event.target.value)}></TextField>
            </DialogListItem.DialogContent>
            <DialogListItem.ItemContent>
                <ListItemText primary="Correspondent" secondary={`Must be "${props.check.name}"`}></ListItemText>
            </DialogListItem.ItemContent>
        </DialogListItem>
    );
};

export default CorrespondentCheckItem;
