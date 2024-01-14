import { ListItemText, TextField } from "@mui/material";
import { StoragePathCheck } from "../types";
import { useState } from "react";
import CheckItemDialog from "../utils/CheckItemDialog";
import CheckItem, { CheckItemDialogPropsType, CheckItemPropsType } from "../utils/CheckItem";


const StoragePathCheckDialog = (props: CheckItemDialogPropsType<StoragePathCheck>) => {

    const [value, setValue] = useState(props.check.name);

    const onChangeDraft = (draft: StoragePathCheck) => {
        draft.name = value;
    }

    return (
        <CheckItemDialog<StoragePathCheck> title="Check Storage Path" onChangeDraft={onChangeDraft} {...props}>
            <TextField label="Storage Path" value={value} onChange={(event) => setValue(event.target.value)}></TextField>
        </CheckItemDialog>
    );
}

const StoragePathCheckItem = (props: CheckItemPropsType<StoragePathCheck>) => {

    return (
        <CheckItem<StoragePathCheck> dialogComponent={StoragePathCheckDialog} {...props}>
            <ListItemText primary="Storage Path" secondary={`Path must be "${props.check.name}"`}></ListItemText>
        </CheckItem>
    );
};

export default StoragePathCheckItem;
