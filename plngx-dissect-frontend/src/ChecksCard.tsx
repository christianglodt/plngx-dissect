import { produce } from "immer";

import { Pattern, Check, PatternEvaluationResult } from "./types";
import ListCard from "./utils/ListCard";
import CreateCheckItemButton from "./checks/CreateCheckItemButton";
import CheckItemFactory from "./checks/CheckItemFactory";

type ChecksCardProps = {
    pattern: Pattern;
    evalResult: PatternEvaluationResult | null | undefined;
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

    const onCheckCreated = (newCheck: Check) => {
        const newPattern = produce(pattern, draft => {
            draft.checks.push(newCheck);
        });
        onChange(newPattern);
    }

    // The CheckItemFactory key is set to the JSON representation of the check below to ensure
    // the CheckItem is remounted when the check is changed. This is necessary because the RegionCheck is
    // changed via drag-and-drop, which does not synchronize the state in the RegionCheckItem dialog.
    return (
        <ListCard title="Checks" headerWidget={<CreateCheckItemButton onCheckCreated={onCheckCreated}/>}>
            { pattern.checks.map((check, index) =>
                <CheckItemFactory key={JSON.stringify(check) + index} check={check} result={props.evalResult?.checks[index]} onChange={(newCheck: Check) => onCheckChange(index, newCheck)} onDelete={() => onCheckDelete(index)}/>
            )}
        </ListCard>
    );
}

export default ChecksCard;
