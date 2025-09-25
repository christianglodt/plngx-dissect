import { ListItemText, TextField } from "@mui/material";
import { produce } from "immer";
import { useState } from "react";
import { TitleRegexCheck } from "../../../types";
import DialogListItem from "../../../utils/DialogListItem";
import { CheckItemPropsType } from "./types";
import CheckResultIcon from "../../../utils/CheckResultIcon";

// TODO optionally allow use of simple expression?
const TitleRegexCheckItem = (props: CheckItemPropsType<TitleRegexCheck>) => {
    const [value, setValue] = useState(props.check.regex);

    const onChangeCanceled = () => {
        setValue(props.check.regex);
    };

    const onChangeConfirmed = () => {
        props.onChange(produce(props.check, draft => {
            draft.regex = value;
        }));
    };

    return (
        <DialogListItem dialogTitle="Check Title" onChangeConfirmed={onChangeConfirmed} onChangeCanceled={onChangeCanceled} onDelete={props.onDelete}>
            <DialogListItem.DialogContent>
                <TextField label="Title" value={value} onChange={(event) => setValue(event.target.value)} sx={{ width: '100%' }} error={props.result?.error != null} helperText={props.result?.error}></TextField>
            </DialogListItem.DialogContent>
            <DialogListItem.ItemContent icon={<CheckResultIcon result={props.result}/>}>
                <ListItemText primary="Title" secondary={`Must match "${props.check.regex}"`}></ListItemText>
            </DialogListItem.ItemContent>
        </DialogListItem>
    );
};

export default TitleRegexCheckItem;
