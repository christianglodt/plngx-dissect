import { ListItemText, TextField } from "@mui/material";
import { DocumentTypeCheck } from "../types";
import { useState } from "react";
import CheckItemDialog from "../utils/CheckItemDialog";
import CheckItem, { CheckItemDialogPropsType, CheckItemPropsType } from "../utils/CheckItem";


const DocumentTypeCheckDialog = (props: CheckItemDialogPropsType<DocumentTypeCheck>) => {

    const [value, setValue] = useState(props.check.name);

    const onChangeDraft = (draft: DocumentTypeCheck) => {
        draft.name = value;
    }

    return (
        <CheckItemDialog<DocumentTypeCheck> title="Check Document Type" onChangeDraft={onChangeDraft} {...props}>
            <TextField label="Document Type" value={value} onChange={(event) => setValue(event.target.value)}></TextField>
        </CheckItemDialog>
    );
}

const DocumentTypeCheckItem = (props: CheckItemPropsType<DocumentTypeCheck>) => {

    return (
        <CheckItem<DocumentTypeCheck> dialogComponent={DocumentTypeCheckDialog} {...props}>
            <ListItemText primary="Document Type" secondary={`Type must be "${props.check.name}"`}></ListItemText>
        </CheckItem>
    );
};

export default DocumentTypeCheckItem;
