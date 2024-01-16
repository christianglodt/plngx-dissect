import { ListItemText, TextField } from "@mui/material";
import { produce } from "immer";
import { useState } from "react";
import { TitleRegexCheck } from "../types";
import CheckListItem from "../utils/CheckListItem";
import { CheckItemPropsType } from "./types";


const TitleRegexCheckItem = (props: CheckItemPropsType<TitleRegexCheck>) => {
    const [value, setValue] = useState(props.check.regex);

    const onChangeConfirmed = () => {
        props.onChange(produce(props.check, draft => {
            draft.regex = value;
        }));
    }

    return (
        <CheckListItem dialogTitle="Check Title" onChangeConfirmed={onChangeConfirmed} onDelete={props.onDelete}>
            <CheckListItem.DialogContent>
                <TextField label="Title" value={value} onChange={(event) => setValue(event.target.value)}></TextField>
            </CheckListItem.DialogContent>
            <CheckListItem.ItemContent>
                <ListItemText primary="Title" secondary={`Must match "${props.check.regex}"`}></ListItemText>
            </CheckListItem.ItemContent>
        </CheckListItem>
    );
};

export default TitleRegexCheckItem;
