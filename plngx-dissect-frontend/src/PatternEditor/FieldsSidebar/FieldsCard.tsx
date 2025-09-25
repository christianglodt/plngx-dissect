import { IconButton, Menu, MenuItem } from "@mui/material";
import { Field } from "../../types";
import { Add } from "@mui/icons-material";
import ListCard from "../../utils/ListCard";
import { produce } from "immer";
import FieldListItem from "./FieldListItem";
import { useState, MouseEvent, Fragment, useContext } from "react";
import AttributeListItem from "./AttributeListItem";
import { PatternEditorContext } from "../PatternEditorContext";


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


const FieldsCard = () => {

    const { pattern, onPatternChange, patternEvaluationResult } = useContext(PatternEditorContext);

    const onFieldChange = (newField: Field, index: number) => {
        onPatternChange(produce(pattern, draft => {
            draft.fields[index] = newField;
        }));
    }

    const onFieldDelete = (index: number) => {
        onPatternChange(produce(pattern, draft => {
            draft.fields.splice(index, 1);
        }));
    }

    const onAddFieldClick = (newField: Field) => {
        onPatternChange(produce(pattern, draft => {
            draft.fields.push(newField);
        }));
    }

    return (
        <ListCard title="Fields" headerWidget={<CreateFieldItemButton onFieldCreated={onAddFieldClick}/>}>
            { pattern.fields.map((field, index) =>
            <Fragment key={index}>
                { field.kind === 'custom' && 
                <FieldListItem field={field} result={patternEvaluationResult?.fields[index]} onChange={(newField: Field) => onFieldChange(newField, index)} onDelete={() => onFieldDelete(index)}/>
                }
                { field.kind === 'attr' && 
                <AttributeListItem field={field} result={patternEvaluationResult?.fields[index]} onChange={(newField: Field) => onFieldChange(newField, index)} onDelete={() => onFieldDelete(index)}/>
                }
            </Fragment>
            )}
        </ListCard>
    );
}

export default FieldsCard;
