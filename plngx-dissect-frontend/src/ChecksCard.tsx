import React from "react";
import { produce } from "immer";

import { Pattern, Check, CheckTypeId, NumPagesCheck, RegionRegexCheck, TitleRegexCheck, CorrespondentCheck, StoragePathCheck, DocumentTypeCheck, TagCheck, DateCreatedCheck } from "./types";
import NumPagesCheckItem from "./checks/NumPagesCheckItem";
import ListCard from "./utils/ListCard";
import CreateCheckItemButton from "./checks/CreateCheckItemButton";
import RegionRegexCheckItem from "./checks/RegionRegexCheckItem";
import TitleRegexCheckItem from "./checks/TitleRegexCheckItem";
import { CheckItemPropsType } from "./utils/CheckItem";
import CorrespondentCheckItem from "./checks/CorrespondentCheckItem";
import DocumentTypeCheckItem from "./checks/DocumentTypeCheckItem";
import StoragePathCheckItem from "./checks/StoragePathCheckItem";
import TagCheckItem from "./checks/TagCheckItem";
import DateCreatedCheckItem from "./checks/DateCreatedCheckItem";


const CheckItemFactory = (props: CheckItemPropsType<Check>): React.JSX.Element => {
    switch (props.check.type) {
        case CheckTypeId.NumPages:
            return <NumPagesCheckItem      {...props as CheckItemPropsType<NumPagesCheck>}/>;
        case CheckTypeId.Region:
            return <RegionRegexCheckItem   {...props as CheckItemPropsType<RegionRegexCheck>}/>;
        case CheckTypeId.Title:
            return <TitleRegexCheckItem    {...props as CheckItemPropsType<TitleRegexCheck>}/>;
        case CheckTypeId.Correspondent:
            return <CorrespondentCheckItem {...props as CheckItemPropsType<CorrespondentCheck>}/>;
        case CheckTypeId.DocumentType:
            return <DocumentTypeCheckItem  {...props as CheckItemPropsType<DocumentTypeCheck>}/>;
        case CheckTypeId.StoragePath:
            return <StoragePathCheckItem   {...props as CheckItemPropsType<StoragePathCheck>}/>;
        case CheckTypeId.Tag:
            return <TagCheckItem           {...props as CheckItemPropsType<TagCheck>}/>;
        case CheckTypeId.DateCreated:
            return <DateCreatedCheckItem   {...props as CheckItemPropsType<DateCreatedCheck>}/>;
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
