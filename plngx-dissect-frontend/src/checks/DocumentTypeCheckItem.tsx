import { ListItemText, TextField } from "@mui/material";
import { produce } from "immer";
import { useState } from "react";
import { DocumentTypeCheck } from "../types";
import CheckListItem from "../utils/CheckListItem";
import { CheckItemPropsType } from "./types";

const DocumentTypeCheckItem = (props: CheckItemPropsType<DocumentTypeCheck>) => {
    const [value, setValue] = useState(props.check.name);

    const onChangeConfirmed = () => {
        props.onChange(produce(props.check, draft => {
            draft.name = value;
        }));
    }

    return (
        <CheckListItem dialogTitle="Check Document Type" onChangeConfirmed={onChangeConfirmed} onDelete={props.onDelete}>
            <CheckListItem.DialogContent>
                <TextField label="Document Type" value={value} onChange={(event) => setValue(event.target.value)}></TextField>
            </CheckListItem.DialogContent>
            <CheckListItem.ItemContent>
                <ListItemText primary="Document Type" secondary={`Must be "${props.check.name}"`}></ListItemText>
            </CheckListItem.ItemContent>
        </CheckListItem>
    );
};

export default DocumentTypeCheckItem;
