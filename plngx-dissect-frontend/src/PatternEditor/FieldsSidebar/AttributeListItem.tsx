import { Autocomplete, Chip, ListItemText, Stack, TextField, Tooltip } from "@mui/material";
import { produce } from "immer";
import React, { SyntheticEvent, useState } from "react";
import DialogListItem from "../../utils/DialogListItem";
import { Field, FieldResult, PaperlessAttribute } from "../../types";
import { ArrowRightAlt, CalendarMonth, Error, Notes, QuestionMark, ShortText } from "@mui/icons-material";
import { usePaperlessElement } from "../../hooks";

type AttributeListItemPropsType = {
    field: Field;
    result: FieldResult | null | undefined;
    onChange: (newField: Field) => void;
    onDelete: () => void;
}

const ATTRIBUTE_TYPE_ICON: Record<string, React.ReactElement> = {
    'string': <ShortText/>,
    'date': <CalendarMonth/>,
}

const AttributeListItem = (props: AttributeListItemPropsType) => {

    const [attr, setAttr] = useState<string|null>(props.field.name);
    const [template, setTemplate] = useState(props.field.template);

    const { data: attrOptions } = usePaperlessElement<PaperlessAttribute>('attributes');

    const selectedAttr = attrOptions?.find(a => a.name === attr);

    const onChangeCanceled = () => {
        setAttr(props.field.name);
        setTemplate(props.field.template);
    };

    const onChangeConfirmed = () => {
        if (attr) {
            props.onChange(produce(props.field, draft => {
                draft.name = attr;
                draft.template = template;
            }));
        }
    };

    const onAttrChange = (_event: SyntheticEvent, value: string | PaperlessAttribute | null) => {
        if (value === null) {
            setAttr(null);
        } else if (value instanceof Object) {
            setAttr(value.name);
        }
    };

    const chipIcon = props.result?.data_type ? ATTRIBUTE_TYPE_ICON[props.result?.data_type] : <QuestionMark/>;

    const secondaryText = (
        <Stack gap={1} alignItems="flex-start">
            <Tooltip title={props.field.template}><Chip color="primary" icon={<Notes/>} label={props.field.template}/></Tooltip>
            {!props.result &&
                <Stack direction="row">
                    <ArrowRightAlt/>
                    <Chip color="info" label="No matching document selected"/>
                </Stack>                
            }
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
        <DialogListItem dialogTitle="Attribute" onChangeConfirmed={onChangeConfirmed} onChangeCanceled={onChangeCanceled} onDelete={props.onDelete}>
            <DialogListItem.DialogContent>
                <Stack gap={2}>
                    <Autocomplete
                        value={selectedAttr}
                        freeSolo
                        onChange={onAttrChange}
                        options={attrOptions || []}
                        sx={{ width: '100%'}}
                        renderInput={(params) => <TextField {...params} label="Document Attribute" />}
                    />
                    <TextField label="Template" value={template} multiline onChange={(event) => setTemplate(event.target.value)}></TextField>
                </Stack>
            </DialogListItem.DialogContent>
            <DialogListItem.ItemContent>
                <ListItemText sx={{ whiteSpace: 'pre-wrap' }} primary={attrOptions?.find(a => a.name === props.field.name)?.label} secondary={secondaryText} secondaryTypographyProps={{ component: 'div' }}></ListItemText>
            </DialogListItem.ItemContent>
        </DialogListItem>
    );
};

export default AttributeListItem;
