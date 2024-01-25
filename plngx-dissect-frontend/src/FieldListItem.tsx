import { Chip, ListItemText, Stack, TextField, Tooltip } from "@mui/material";
import { produce } from "immer";
import React, { useState } from "react";
import DialogListItem from "./utils/DialogListItem";
import { Field, FieldResult } from "./types";
import PaperlessElementSelector from "./utils/PaperlessElementSelector";
import { ArrowRightAlt, CalendarMonth, CreditCard, Error, Flag, Link, Notes, Numbers, QuestionMark, ShortText } from "@mui/icons-material";

type FieldListItemPropsType = {
    field: Field;
    result: FieldResult | null | undefined;
    onChange: (newField: Field) => void;
    onDelete: () => void;
}

const FIELD_TYPE_ICON: Record<string, React.ReactElement> = {
    'string': <ShortText/>,
    'url': <Link/>,
    'date': <CalendarMonth/>,
    'boolean': <Flag/>,
    'integer': <Numbers/>,
    'float': <Numbers/>,
    'monetary': <CreditCard/>,
    'documentlink': <Link/>
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

    const chipIcon = props.result?.data_type ? FIELD_TYPE_ICON[props.result?.data_type] : <QuestionMark/>;

    const secondaryText = (
        <Stack gap={1} alignItems="flex-start">
            <Tooltip title={props.field.template}><Chip color="primary" icon={<Notes/>} label={props.field.template}/></Tooltip>
            { props.result?.value &&
            <Stack direction="row">
                <ArrowRightAlt/><Tooltip title={props.result.value}><Chip color="success" icon={chipIcon} label={props.result.value}/></Tooltip>
            </Stack>
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
