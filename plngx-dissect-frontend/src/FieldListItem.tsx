import { ListItemText, Stack, TextField } from "@mui/material";
import { produce } from "immer";
import { useState } from "react";
import CheckListItem from "./utils/CheckListItem";
import { Field } from "./types";

type FieldListItemPropsType = {
    field: Field;
    onChange: (newField: Field) => void;
    onDelete: () => void;
}

const FieldListItem = (props: FieldListItemPropsType) => {

    const [name, setName] = useState(props.field.name);
    const [template, setTemplate] = useState(props.field.template);

    const onChangeConfirmed = () => {
        props.onChange(produce(props.field, draft => {
            draft.name = name;
            draft.template = template;
        }));
    }

    return (
        <CheckListItem dialogTitle="Region" onChangeConfirmed={onChangeConfirmed} onDelete={props.onDelete}>
            <CheckListItem.DialogContent>
                <Stack gap={2}>
                    <TextField label="Name" value={name} onChange={(event) => setName(event.target.value)}></TextField>
                    <TextField label="Template" value={template} onChange={(event) => setTemplate(event.target.value)}></TextField>
                </Stack>
            </CheckListItem.DialogContent>
            <CheckListItem.ItemContent>
                <ListItemText sx={{ whiteSpace: 'pre-wrap' }} primary={`Field ${props.field.name}`} secondary={props.field.template}></ListItemText>
            </CheckListItem.ItemContent>
        </CheckListItem>
    );
};

export default FieldListItem;
