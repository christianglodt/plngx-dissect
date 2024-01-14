import { ListItemText, TextField } from "@mui/material";
import { TitleRegexCheck } from "../types";
import { useState } from "react";
import CheckItemDialog from "../utils/CheckItemDialog";
import CheckItem, { CheckItemDialogPropsType, CheckItemPropsType } from "../utils/CheckItem";


const TitleRegexCheckDialog = (props: CheckItemDialogPropsType<TitleRegexCheck>) => {

    const [value, setValue] = useState(props.check.regex);

    const onChangeDraft = (draft: TitleRegexCheck) => {
        draft.regex = value;
    }

    return (
        <CheckItemDialog<TitleRegexCheck> title="Check Number of Pages" onChangeDraft={onChangeDraft} {...props}>
            <div>Number of pages must be:</div>
            <TextField value={value} onChange={(event) => setValue(event.target.value)}></TextField>
        </CheckItemDialog>
    );
}

const TitleRegexCheckItem = (props: CheckItemPropsType<TitleRegexCheck>) => {

    return (
        <CheckItem<TitleRegexCheck> dialogComponent={TitleRegexCheckDialog} {...props}>
            <ListItemText primary="Title Text Match" secondary={`Title must match "${props.check.regex}"`}></ListItemText>
        </CheckItem>
    );
};

export default TitleRegexCheckItem;
