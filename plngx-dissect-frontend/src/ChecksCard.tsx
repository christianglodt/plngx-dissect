import { IconButton } from "@mui/material";
import { Pattern, Check } from "./types";
import { Add } from "@mui/icons-material";
import NumPagesCheckItem from "./checks/NumPagesCheckItem";
import ListCard from "./utils/ListCard";
import { produce } from "immer";


type CheckFactoryProps = {
    check: Check;
    onChange: (newCheck: Check) => void;
    onDelete: () => void;
}

const CheckFactory = (props: CheckFactoryProps) => {

    if (props.check.type == 'num_pages') {
        return <NumPagesCheckItem check={props.check} onChange={props.onChange} onDelete={props.onDelete}/>
    }
};

type ChecksCardProps = {
    pattern: Pattern;
    onChange: (newPattern: Pattern) => void;
}

const ChecksCard = (props: ChecksCardProps) => {

    const { pattern, onChange } = props;

    const onCheckChange = (index: number, newCheck: Check) => {
        const newPattern = produce(pattern, draft => {
            draft.checks[index] = newCheck;
        });
        onChange(newPattern);
    }

    const onCheckDelete = (index: number) => {
        const newPattern = produce(pattern, draft => {
            draft.checks.splice(index, 1);
        });
        onChange(newPattern);
    }

    return (
        <ListCard title="Checks" headerWidget={<IconButton><Add/></IconButton>}>
            { pattern.checks.map((check, index) =>
                <CheckFactory key={index} check={check} onChange={(newCheck) => onCheckChange(index, newCheck)} onDelete={() => onCheckDelete(index)}/>
            )}
        </ListCard>
    );
}

export default ChecksCard;
