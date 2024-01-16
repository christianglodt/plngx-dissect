import React from "react";

import { Check, CheckTypeId, NumPagesCheck, RegionRegexCheck, TitleRegexCheck, CorrespondentCheck, StoragePathCheck, DocumentTypeCheck, TagCheck, DateCreatedCheck, AndCheck, OrCheck, NotCheck } from "../types";
import NumPagesCheckItem from "./NumPagesCheckItem";
import RegionRegexCheckItem from "./RegionRegexCheckItem";
import TitleRegexCheckItem from "./TitleRegexCheckItem";
import CorrespondentCheckItem from "./CorrespondentCheckItem";
import DocumentTypeCheckItem from "./DocumentTypeCheckItem";
import StoragePathCheckItem from "./StoragePathCheckItem";
import TagCheckItem from "./TagCheckItem";
import DateCreatedCheckItem from "./DateCreatedCheckItem";
import AndCheckItem from "./AndCheckItem";
import { CheckItemPropsType } from "./types";
import OrCheckItem from "./OrCheckItem";
import NotCheckItem from "./NotCheckItem";

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
        case CheckTypeId.And:
            return <AndCheckItem           {...props as CheckItemPropsType<AndCheck>}/>;
        case CheckTypeId.Or:
            return <OrCheckItem            {...props as CheckItemPropsType<OrCheck>}/>;
        case CheckTypeId.Not:
            return <NotCheckItem            {...props as CheckItemPropsType<NotCheck>}/>;
    }
};

export default CheckItemFactory;
