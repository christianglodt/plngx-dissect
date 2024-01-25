import { Chip, ListItemText, Stack, TextField, Tooltip } from "@mui/material";
import { produce } from "immer";
import { useState } from "react";
import DialogListItem from "./utils/DialogListItem";
import { Field, FieldResult } from "./types";
import PaperlessElementSelector from "./utils/PaperlessElementSelector";
import { ArrowRightAlt, Error, Notes } from "@mui/icons-material";

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

    const secondaryText = (
        <Stack gap={1} alignItems="flex-start">
            <Chip color="primary" icon={<Notes/>} label={props.field.template}/>
            { props.result?.value &&
            <Chip color="success" icon={<ArrowRightAlt/>} label={props.result.value}/>
            }
            { props.result?.error &&
            <Tooltip title={props.result.error}><Chip color="error" icon={<Error/>} label={props.result.error}/></Tooltip>
            }
        </Stack>
    );

    return (
        <DialogListItem dialogTitle="Field" onChangeConfirmed={onChangeConfirmed} onDelete={props.onDelete}>
            <DialogListItem.DialogContent>
                <Stack gap={2}>
                    <PaperlessElementSelector value={name} onChange={setName} label="Custom Field" slug="custom_fields"/>
                    <TextField label="Template" value={template} multiline onChange={(event) => setTemplate(event.target.value)}></TextField>
                </Stack>
            </DialogListItem.DialogContent>
            <DialogListItem.ItemContent>
                <ListItemText sx={{ whiteSpace: 'pre-wrap' }} primary={props.field.name} secondary={secondaryText}></ListItemText>
            </DialogListItem.ItemContent>
        </DialogListItem>
    );
};

export default FieldListItem;
