import React from "react";
import { produce } from "immer";

import { Pattern, Check, CheckTypeId } from "./types";
import NumPagesCheckItem from "./checks/NumPagesCheckItem";
import ListCard from "./utils/ListCard";
import CreateCheckItemButton from "./checks/CreateCheckItemButton";
import RegionRegexCheckItem from "./checks/RegionRegexCheckItem";


type CheckItemFactoryProps = {
    check: Check;
    onChange: (newCheck: Check) => void;
    onDelete: () => void;
}

const CheckItemFactory = (props: CheckItemFactoryProps): React.JSX.Element => {
    switch (props.check.type) {
        case CheckTypeId.NumPages:
            return <NumPagesCheckItem check={props.check} onChange={props.onChange} onDelete={props.onDelete}/>;
        case CheckTypeId.Region:
            return <RegionRegexCheckItem check={props.check} onChange={props.onChange} onDelete={props.onDelete}/>
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

    const onCheckCreated = (newCheck: Check) => {
        const newPattern = produce(pattern, draft => {
            draft.checks.push(newCheck);
        });
        onChange(newPattern);
    }

    return (
        <ListCard title="Checks" headerWidget={<CreateCheckItemButton onCheckCreated={onCheckCreated}/>}>
            { pattern.checks.map((check, index) =>
                <CheckItemFactory key={index} check={check} onChange={(newCheck) => onCheckChange(index, newCheck)} onDelete={() => onCheckDelete(index)}/>
            )}
        </ListCard>
    );
}

export default ChecksCard;
