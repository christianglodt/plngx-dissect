import { ListItemText, TextField } from "@mui/material";
import { CorrespondentCheck } from "../types";
import { useState } from "react";
import CheckItemDialog from "../utils/CheckItemDialog";
import CheckItem, { CheckItemDialogPropsType, CheckItemPropsType } from "../utils/CheckItem";


const CorrespondentCheckDialog = (props: CheckItemDialogPropsType<CorrespondentCheck>) => {

    const [value, setValue] = useState(props.check.name);

    const onChangeDraft = (draft: CorrespondentCheck) => {
        draft.name = value;
    }

    return (
        // TODO autocomplete dropdown
        <CheckItemDialog<CorrespondentCheck> title="Check Correspondent" onChangeDraft={onChangeDraft} {...props}>
            <TextField label="Correspondent" value={value} onChange={(event) => setValue(event.target.value)}></TextField>
        </CheckItemDialog>
    );
}

const CorrespondentCheckItem = (props: CheckItemPropsType<CorrespondentCheck>) => {

    return (
        <CheckItem<CorrespondentCheck> dialogComponent={CorrespondentCheckDialog} {...props}>
            <ListItemText primary="Correspondent Name" secondary={`Name must be "${props.check.name}"`}></ListItemText>
        </CheckItem>
    );
};

export default CorrespondentCheckItem;
