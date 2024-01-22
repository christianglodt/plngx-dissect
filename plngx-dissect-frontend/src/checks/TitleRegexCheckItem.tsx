import { ListItemText, TextField } from "@mui/material";
import { produce } from "immer";
import { useState } from "react";
import { TitleRegexCheck } from "../types";
import DialogListItem from "../utils/DialogListItem";
import { CheckItemPropsType } from "./types";
import { CheckCircle } from "@mui/icons-material";


const TitleRegexCheckItem = (props: CheckItemPropsType<TitleRegexCheck>) => {
    const [value, setValue] = useState(props.check.regex);

    const onChangeConfirmed = () => {
        props.onChange(produce(props.check, draft => {
            draft.regex = value;
        }));
    }

    return (
        <DialogListItem dialogTitle="Check Title" onChangeConfirmed={onChangeConfirmed} onDelete={props.onDelete}>
            <DialogListItem.DialogContent>
                <TextField label="Title" value={value} onChange={(event) => setValue(event.target.value)}></TextField>
            </DialogListItem.DialogContent>
            <DialogListItem.ItemContent icon={props.matches && <CheckCircle/>}>
                <ListItemText primary="Title" secondary={`Must match "${props.check.regex}"`}></ListItemText>
            </DialogListItem.ItemContent>
        </DialogListItem>
    );
};

export default TitleRegexCheckItem;
