import { IconButton, Menu, MenuItem } from "@mui/material";
import { Field, Pattern, PatternEvaluationResult } from "./types";
import { Add } from "@mui/icons-material";
import ListCard from "./utils/ListCard";
import { produce } from "immer";
import FieldListItem from "./FieldListItem";
import { useState, MouseEvent, Fragment } from "react";
import AttributeListItem from "./AttributeListItem";


type CreateFieldItemButtonPropsType = {
    onFieldCreated: (newField: Field) => void;
    disabled?: boolean;
}

const CreateFieldItemButton = (props: CreateFieldItemButtonPropsType) => {
    const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);

    const onCreateClicked = (event: MouseEvent<HTMLButtonElement>) => {
        setAnchorElement(event.currentTarget);
    }

    const onCreateAttributeFieldClicked = () => {
        const field: Field = {
            kind: 'attr',
            name: 'Attribute',
            template: '{{ value }}'
        };
        props.onFieldCreated(field);
        setAnchorElement(null);
    }

    const onCreateCustomFieldClicked = () => {
        const field: Field = {
            kind: 'custom',
            name: 'Field',
            template: '{{ value }}'
        };
        props.onFieldCreated(field);
        setAnchorElement(null);
    }

    return (
        <>
            <IconButton onClick={onCreateClicked} disabled={props.disabled}><Add/></IconButton>
            <Menu anchorEl={anchorElement} open={anchorElement !== null} onClose={() => setAnchorElement(null)}>
                <MenuItem onClick={onCreateAttributeFieldClicked}>Attribute</MenuItem>
                <MenuItem onClick={onCreateCustomFieldClicked}>Custom Field</MenuItem>
            </Menu>
        </>
    );
}


type FieldsCardProps = {
    pattern: Pattern;
    evalResult: PatternEvaluationResult | null | undefined;
    onChange: (newPattern: Pattern) => void;
}

const FieldsCard = (props: FieldsCardProps) => {

    const { pattern, onChange } = props;

    const onFieldChange = (newField: Field, index: number) => {
        onChange(produce(pattern, draft => {
            draft.fields[index] = newField;
        }));
    }

    const onFieldDelete = (index: number) => {
        onChange(produce(pattern, draft => {
            draft.fields.splice(index, 1);
        }));
    }

    const onAddFieldClick = (newField: Field) => {
        onChange(produce(pattern, draft => {
            draft.fields.push(newField);
        }));
    }

    return (
        <ListCard title="Fields" headerWidget={<CreateFieldItemButton onFieldCreated={onAddFieldClick}/>}>
            { pattern.fields.map((field, index) =>
            <Fragment key={index}>
                { field.kind === 'custom' && 
                <FieldListItem field={field} result={props.evalResult?.fields[index]} onChange={(newField: Field) => onFieldChange(newField, index)} onDelete={() => onFieldDelete(index)}/>
                }
                { field.kind === 'attr' && 
                <AttributeListItem field={field} result={props.evalResult?.fields[index]} onChange={(newField: Field) => onFieldChange(newField, index)} onDelete={() => onFieldDelete(index)}/>
                }
            </Fragment>
            )}
        </ListCard>
    );
}

export default FieldsCard;
