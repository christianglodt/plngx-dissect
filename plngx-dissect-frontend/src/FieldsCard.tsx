import { IconButton } from "@mui/material";
import { Field, Pattern } from "./types";
import { Add } from "@mui/icons-material";
import ListCard from "./utils/ListCard";
import { produce } from "immer";
import FieldListItem from "./FieldListItem";

type FieldsCardProps = {
    pattern: Pattern;
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

    const onAddFieldClick = () => {
        onChange(produce(pattern, draft => {
            draft.fields.push({
                name: 'field',
                template: '{{ value }}'
            });
        }));
    }
    return (
        <ListCard title="Fields" headerWidget={<IconButton onClick={onAddFieldClick}><Add/></IconButton>}>
            { pattern.fields.map((field, index) =>
            <FieldListItem key={index} field={field} onChange={(newField: Field) => onFieldChange(newField, index)} onDelete={() => onFieldDelete(index)}/>
            )}
        </ListCard>
    );
}

export default FieldsCard;
