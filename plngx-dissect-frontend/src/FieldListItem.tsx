import { Alert, ListItemText, Stack, TextField } from "@mui/material";
import { produce } from "immer";
import { useState } from "react";
import DialogListItem from "./utils/DialogListItem";
import { Field, FieldResult } from "./types";
import PaperlessElementSelector from "./utils/PaperlessElementSelector";

type FieldListItemPropsType = {
    field: Field;
    result: FieldResult | null | undefined;
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

    const secondaryText = <>
        <div>{props.field.template}</div>
        { props.result?.value }
        { props.result?.error &&
        <Alert severity="error">{props.result.error}</Alert>
        }
    </>;

    return (
        <DialogListItem dialogTitle="Region" onChangeConfirmed={onChangeConfirmed} onDelete={props.onDelete}>
            <DialogListItem.DialogContent>
                <Stack gap={2}>
                    <PaperlessElementSelector value={name} onChange={setName} label="Field" slug="custom_fields"/>
                    <TextField label="Template" value={template} onChange={(event) => setTemplate(event.target.value)}></TextField>
                </Stack>
            </DialogListItem.DialogContent>
            <DialogListItem.ItemContent>
                <ListItemText sx={{ whiteSpace: 'pre-wrap' }} primary={`Field ${props.field.name}`} secondary={secondaryText}></ListItemText>
            </DialogListItem.ItemContent>
        </DialogListItem>
    );
};

export default FieldListItem;
