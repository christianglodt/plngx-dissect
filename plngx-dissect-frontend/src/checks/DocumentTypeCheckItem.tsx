import { ListItemText, TextField } from "@mui/material";
import { produce } from "immer";
import { useState } from "react";
import { DocumentTypeCheck } from "../types";
import DialogListItem from "../utils/DialogListItem";
import { CheckItemPropsType } from "./types";

const DocumentTypeCheckItem = (props: CheckItemPropsType<DocumentTypeCheck>) => {
    const [value, setValue] = useState(props.check.name);

    const onChangeConfirmed = () => {
        props.onChange(produce(props.check, draft => {
            draft.name = value;
        }));
    }

    return (
        <DialogListItem dialogTitle="Check Document Type" onChangeConfirmed={onChangeConfirmed} onDelete={props.onDelete}>
            <DialogListItem.DialogContent>
                <TextField label="Document Type" value={value} onChange={(event) => setValue(event.target.value)}></TextField>
            </DialogListItem.DialogContent>
            <DialogListItem.ItemContent>
                <ListItemText primary="Document Type" secondary={`Must be "${props.check.name}"`}></ListItemText>
            </DialogListItem.ItemContent>
        </DialogListItem>
    );
};

export default DocumentTypeCheckItem;
